{-# LANGUAGE NamedFieldPuns #-}
{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE FlexibleContexts #-}
{-# LANGUAGE GADTs #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE BlockArguments #-}
{-# LANGUAGE RecordWildCards #-}
{-# LANGUAGE RankNTypes #-}
{-# LANGUAGE OverloadedRecordDot #-}
{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TypeFamilies #-}

module Plutus.Certification.Server.Instance where

import Conduit
import Control.Monad.Catch
import Servant
import Servant.Client as Client
import Control.Monad.State.Strict
import Observe.Event
import Observe.Event.BackendModification
import Network.URI
import Plutus.Certification.API as API
import Plutus.Certification.GitHubClient
import Control.Monad.Except
import Data.Time.LocalTime
import Data.Maybe
import Data.Aeson
import Network.HTTP.Client hiding (Proxy,parseUrl)

import Network.HTTP.Types
import Control.Applicative
import Data.Text as Text hiding (elem,replicate, last,words,replicate)
import Data.Text.Encoding
import Plutus.Certification.WalletClient (WalletArgs(walletCertificationPrice))
import IOHK.Certification.Interface hiding (Status)
import Plutus.Certification.Server.Internal

import Servant.Server.Experimental.Auth (AuthServerData)
import Data.Time (addUTCTime)
import Plutus.Certification.JWT (jwtEncode, JWTArgs(..))
import IOHK.Certification.SignatureVerification as SV
import Data.Time.Clock.POSIX (utcTimeToPOSIXSeconds)
import Text.Read (readMaybe)
import Data.HashSet as HashSet

import qualified Data.ByteString.Lazy.Char8 as LSB
import qualified Paths_plutus_certification as Package
import qualified Plutus.Certification.WalletClient as Wallet
import qualified IOHK.Certification.Persistence as DB
import qualified Plutus.Certification.Web3StorageClient  as IPFS

hoistServerCaps :: (Monad m) => (forall x . m x -> n x) -> ServerCaps m r -> ServerCaps n r
hoistServerCaps nt (ServerCaps {..}) = ServerCaps
  { submitJob = \mods ghAccessTokenM -> nt . submitJob mods ghAccessTokenM
  , getRuns = \mods -> transPipe nt . getRuns mods
  , abortRuns = \mods -> nt . abortRuns mods
  , getLogs = \mods act -> transPipe nt . getLogs mods act
  }


-- | A type for server arguments including the wallet arguments
-- and the github access token as optional
data ServerArgs m r = ServerArgs
  { serverCaps :: ServerCaps m r
  , serverWalletArgs :: Wallet.WalletArgs
  , githubToken :: Maybe GitHubAccessToken
  , serverJWTArgs :: Maybe JWTArgs
  , serverEventBackend :: EventBackend m r ServerEventSelector
  , serverSigningTimeout :: Seconds
  , serverWhitelist :: Maybe Whitelist
  }

type Whitelist = HashSet Text

-- | verify if the address is whitelisted
verifyWhiteList :: MonadError ServerError m => Maybe (HashSet Text) -> Text -> m ()
verifyWhiteList Nothing _ = pure ()
verifyWhiteList (Just whitelist) addr =
  unless (HashSet.member addr whitelist) $ throw401 "address not whitelisted"
  where
  throw401 msg = throwError $ err401 { errBody = msg }

type Seconds = Integer

-- | An implementation of 'API'
server :: ( MonadMask m
          , MonadIO m
          , MonadError ServerError m
          -- constraint for the auth server data to be equal to the tuple
          -- of profile id and user address
          , AuthServerData (AuthProtect auth) ~ (DB.ProfileId,UserAddress)
          )
       => ServerArgs m r
       -> ServerT (API auth) m
server ServerArgs{..} = NamedAPI
  { version = withEvent eb Version . const . pure $ VersionV1 Package.version
  , versionHead = withEvent eb Version . const $ pure NoContent
  , walletAddress = withEvent eb WalletAddress . const $ pure serverWalletArgs.walletAddress
  , createRun = \(profileId,_) commitOrBranch -> withEvent eb CreateRun \ev -> do
      (fref,profileAccessToken) <- getFlakeRefAndAccessToken profileId commitOrBranch
      let githubToken' =  profileAccessToken <|> githubToken
      -- ensure the ref is in the right format before start the job
      (commitDate,commitHash) <- getCommitDateAndHash githubToken' fref
      addField ev $ CreateRunRef fref
      res <- submitJob (setAncestor $ reference ev) githubToken' fref
      addField ev $ CreateRunID res
      createDbRun fref profileId res commitDate commitHash
      pure res
  , getRun = \rid@RunID{..} -> withEvent eb GetRun \ev -> runConduit
      ( getRuns (setAncestor $ reference ev) rid .| evalStateC Queued consumeRuns
      ) >>= dbSync uuid
  , getRunDetails = \rid@RunID{..} -> withEvent eb GetRunDetails \ev -> do
      addField ev rid
      -- get the run details from the db
      DB.withDb ( DB.getRun uuid )
        >>= maybeToServerError err404 "Run not found"
  , abortRun = \(profileId,_) rid@RunID{..} deleteRun -> withEvent eb AbortRun \ev -> do
      addField ev rid
      requireRunIdOwner profileId uuid
      -- abort the run if is still running
      status <- runConduit $
        getRuns (setAncestor $ reference ev) rid .| evalStateC Queued consumeRuns
      when (toDbStatus status == DB.Queued) $ do
        -- finally abort the run
        abortRuns (setAncestor $ reference ev) rid
        -- if abortion succeeded mark it in the db
        void (getNow >>= DB.withDb . DB.updateFinishedRun uuid False)

      -- depending on the deleteRun flag either ...
      if deleteRun == Just True
         -- delete the run from the db
         then void (DB.withDb $ DB.deleteRun uuid)
         -- or just mark it as aborted
         else void (getNow >>= DB.withDb . DB.markAsAborted uuid)
      pure NoContent
  , getProfileBalance = \(profileId,UserAddress{..}) -> withEvent eb GetProfileBalance \ev -> do
      addField ev profileId
      fromMaybe 0 <$> DB.withDb (DB.getProfileBalance unUserAddress)
  , getLogs = \rid afterM actionTypeM -> withEvent eb GetRunLogs \ev -> do
      addField ev rid
      let dropCond = case afterM of
            (Just after) ->
              let afterUtc = zonedTimeToUTC after
              in ((<= afterUtc) . zonedTimeToUTC . time)
            Nothing -> const False
      runConduit
         $ getLogs (setAncestor $ reference ev) actionTypeM rid
        .| (dropWhileC dropCond >> sinkList)
  , getRuns = \(profileId,_) afterM countM -> do
      DB.withDb $ DB.getRuns profileId afterM countM
  , updateCurrentProfile = \(profileId,UserAddress ownerAddress) ProfileBody{..} -> do
      let dappId = profileId
      let dappM = fmap (\DAppBody{..} -> DB.DApp{
            dappId, dappName,dappOwner,dappVersion,dappRepo,
            dappGitHubToken = fmap (ghAccessTokenToText . unApiGitHubAccessToken) dappGitHubToken
          }) dapp
      DB.withDb $ do
        _ <- DB.upsertProfile (DB.Profile{..}) dappM
        -- it's safe to call partial function fromJust

        fromJust <$> DB.getProfile profileId
  , getCurrentProfile = \(profileId,_) -> getProfileDTO profileId

  -- TODO: Add instrumentation
  -- TODO: There might be an issue if more than one certification is started at
  -- the same time for the same Run:
  -- Multiple transactions are going to be broadcasted at the same time and
  -- therefore we are going to pay multiple fees.
  -- We have to somehow create a lock mechanism for every certification per run
  , createCertification = \(profileId,_) rid@RunID{..} -> withEvent eb StartCertification \ev -> do
    addField ev (StartCertificationRunID rid)
    -- ensure runId belongs to the owner
    requireRunIdOwner profileId uuid

    -- get the runId report
    status <- runConduit (getRuns (setAncestor $ reference ev) rid .| evalStateC Queued consumeRuns)

    -- sync the run with the db and return the db-run information
    DB.Run{runStatus} <- getRunAndSync rid status

    let certResultM = toCertificationResult status
    (IPFS.UploadResponse ipfsCid _) <- maybe
      (throwError $ err403 { errBody = "Incompatible status for certification"})
      uploadToIpfs certResultM
    addField ev (StartCertificationIpfsCid ipfsCid)

    -- ensure there is no certificate already created
    when (runStatus `elem` [DB.ReadyForCertification, DB.Certified]) $
      throwError err403 { errBody = "Certification already started" }

    -- ensure the run is finished
    unless (runStatus == DB.Succeeded) $
      throwError err403 { errBody = "Transaction status not fit for certification" }

    -- mark the run as ready for certification
    getNow
      >>= DB.withDb . DB.markAsReadyForCertification uuid ipfsCid
      >> pure NoContent -- yep, we don't need to return anything

  , getCertification = \rid@RunID{..} -> withEvent eb GetCertification \ev -> do
    addField ev rid
    DB.withDb (DB.getCertification uuid)
      >>= maybeToServerError err404 "Certification not found"
  , getRepositoryInfo = \owner repo apiGhAccessTokenM -> withEvent eb GetRepoInfo \ev -> do
    addField ev (GetRepoInfoOwner owner)
    addField ev (GetRepoInfoRepo repo)
    let ghAccessTokenM = unApiGitHubAccessToken <$> apiGhAccessTokenM
        -- if there is no github access token, we use the default one
        -- provided from arguments
        ghAccessTokenM' =  ghAccessTokenM <|> githubToken
    liftIO ( getRepoInfo ghAccessTokenM' owner repo ) >>= fromClientResponse
  , login = \LoginBody{..} -> whenJWTProvided \JWTArgs{..} -> withEvent eb Login \ev -> do
      addField ev address
      now <- getNow
      -- verify whitelist
      verifyWhiteList serverWhitelist address
      -- ensure the profile exists
      (pid,UserAddress userAddress) <- ensureProfile $  encodeUtf8 address
      --verify the wallet signature validation
      verifySignature key signature address
      -- verify the message timestamp
      verifyMessageTimeStamp signature


      let -- minimum between the expiration time and the jwtExpirationSeconds
          expiration' = maybe jwtExpirationSeconds (min jwtExpirationSeconds) expiration
          expiresAt = addUTCTime (fromIntegral expiration') now

      -- encode jwt with with expiration time
      pure $ jwtEncode jwtSecret expiresAt (DB.fromId pid, userAddress)
  , serverTimestamp = withEvent eb Version (const $ round . utcTimeToPOSIXSeconds <$> getNow)
  }
  where
    fromClientResponse = \case
      Left err -> throwError $ serverErrorFromClientError err
      Right a -> pure a
    serverErrorFromClientError :: ClientError -> ServerError
    serverErrorFromClientError clientResponse =
      case clientResponse of
        FailureResponse _ resp -> errorFromClientResponse resp
        DecodeFailure _ resp -> err500WithResp resp
        UnsupportedContentType _ resp -> err500WithResp resp
        InvalidContentTypeHeader resp -> err500WithResp resp
        ConnectionError _ -> err500 {errBody = "Connection error"}
      where
      err500WithResp resp = err500 {errBody = LSB.pack $ show resp}

    errorFromClientResponse :: Client.Response -> ServerError
    errorFromClientResponse resp =
      let (Status code msg) = responseStatusCode resp
          err = ServerError code "GitHub API error" (LSB.fromStrict msg) []
      in err
    -- | unfolds the payload from the signed message
    unfoldMessage bs = case unfoldPayload bs of
      Left err -> throwError err403 { errBody = LSB.pack err }
      Right payload -> pure . decodeUtf8 . unMessage $ payload.message

    -- | extracts the timestamp from the signed message
    extractTimeStampFromMsg bs = do
      msg <- unfoldMessage bs
      case extractTimestamp msg of
        Nothing -> throwError err403 { errBody = "Invalid message format"}
        Just ts -> pure ts

    -- | extracts the timestamp from the signed message and verifies it
    verifyMessageTimeStamp = extractTimeStampFromMsg >=> verifyTimeStamp

    -- | verifies that the timestamp from the signed message is not older than `serverSigningTimeout`
    verifyTimeStamp ts = do
      now <- round . utcTimeToPOSIXSeconds <$> getNow
      let diff = now - ts
      -- if the difference greater than the timeout or the timestamp is in the future
      -- then the message is invalid
      when (diff > serverSigningTimeout || diff < 0) $
        throwError err403 { errBody = "Invalid message timestamp"}

    -- | extracts an int time stamp from a string of form "xxxxxx<<timestamp>>xxxxxx"
    -- the timestamp is enclosed in double angle brackets
    extractTimestamp :: Read b => Text -> Maybe b
    extractTimestamp t = do
      let (_,post) = Text.breakOn "<<" t
      let (ts,post') = Text.breakOn ">>" (Text.drop 2 post)
      guard $ not $ Text.null post'
      readMaybe $ Text.unpack ts

    ServerCaps {..} = serverCaps
    jwtArgs = serverJWTArgs
    eb = serverEventBackend
    verifySignature key signature address =
      let res = verifyCIP30Signature key signature Nothing (Just $ Bech32Address address)
      in either (\err ->throwError err403 { errBody = LSB.pack err}) (const $ pure ()) res

    whenJWTProvided handler = case jwtArgs of
      Nothing -> throwError err404
      Just jwtArgs'-> handler jwtArgs'

    uploadToIpfs :: (Monad m, MonadIO m, MonadError ServerError m) => CertificationResult -> m IPFS.UploadResponse
    uploadToIpfs certResultM = do
      resp <- IPFS.uploadReportToIpfs IPFS.apiKey (LSB.toStrict $ encode certResultM)
      case resp of
        Left (IPFS.DecodeFailure _ err) -> throwError err500 { errBody = encode err }
        Left (IPFS.HttpError resp') ->
          let (Status code msg) = responseStatus resp'
              err = ServerError code "IPFS gateway error" (LSB.fromStrict msg) []
          in throwError err
        Right result -> pure result
    getRunAndSync RunID{..} status = do
      run <- DB.withDb (DB.getRun uuid)
        >>= maybeToServerError err404 "No Run"
      _ <- dbSync uuid status
      pure run

    getFlakeRefAndAccessToken profileId commitOrBranch =
      getProfileDApp profileId >>= flip createFlakeRef commitOrBranch

    eitherToServerError baseHttpError f = either
      (\cerr -> throwError baseHttpError { errBody = f cerr})
      pure

    maybeToServerError baseHttpError msg = maybe
      (throwError baseHttpError { errBody = msg})
      pure

    createFlakeRef DB.DApp{..} CommitOrBranch{..} = do
      when (Text.null dappOwner || Text.null dappRepo )
        $ forbidden "DApp owner or repo are empty"

      let uri = "github:" <> encodeUtf8 dappOwner <> "/" <> encodeUtf8 dappRepo <> "/" <> encodeUtf8 commitOrBranch
      fref <- eitherToServerError
        err400 LSB.pack
        (mimeUnrender (Proxy :: Proxy PlainText) (LSB.fromStrict uri))
      pure (fref,knownGhAccessTokenFromText <$> dappGitHubToken)

    forbidden str = throwError $ err403 { errBody = str}

    getProfileDApp profileId = DB.withDb (DB.getProfileDApp profileId)
        >>= withDappNotAvailableMsg

    withDappNotAvailableMsg = maybeToServerError err403 "DApp profile data not available"

    getProfileDTO profileId = DB.withDb (DB.getProfile profileId)
        >>= maybeToServerError err404 "Profile not found"

    requireRunIdOwner profileId uuid = do
      -- ensure is the owner of the run
      isOwner <- (== Just profileId) <$> DB.withDb (DB.getRunOwner uuid)
      unless isOwner $ throwError err403

    getCommitDateAndHash githubToken' FlakeRef{..} = do
      (owner,repo,path') <- extractUriSegments uri
      -- TODO: here we might have to use a github token
      -- provided by the user for authorizing our app to access a private repo
      commitInfoE <- liftIO $ getCommitInfo githubToken' owner repo path'
      case commitInfoE of
           Left e -> throwError err400 { errBody = LSB.pack $ show e}
           Right (Commit hash (CommitDetails _ _ (Author _ _ time))) -> pure (time,hash)

    extractUriSegments uri = case pack <$> pathSegments uri of
        owner:repo:path':_ -> pure (owner,repo,path')
        _ -> throwError err400 { errBody = "Wrong flake-ref details"}

    createDbRun FlakeRef{..} profileId res commitDate commitHash= do
      now <- getNow
      let uriTxt = pack $ uriToString id uri ""
      DB.withDb $ DB.createRun (uuid res) now uriTxt commitDate
        commitHash (serverWalletArgs.walletCertificationPrice) profileId
