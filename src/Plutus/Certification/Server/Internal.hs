{-# LANGUAGE FlexibleContexts #-}
{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE GADTs #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE BlockArguments #-}
{-# LANGUAGE RankNTypes #-}
{-# LANGUAGE OverloadedRecordDot #-}
{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TypeFamilies #-}

module Plutus.Certification.Server.Internal where

import Conduit
import Control.Monad.Catch
import Data.Aeson
import Data.Void
import Servant
import Control.Monad.State.Strict
import Observe.Event.BackendModification
import Observe.Event.Render.JSON
import Network.URI
import IOHK.Certification.Interface hiding (Status)
import Servant.Server.Experimental.Auth
import Plutus.Certification.API as API
import Data.Time
import Data.Text as Text hiding (elem,replicate, last)
import Data.UUID

import qualified IOHK.Certification.Persistence as DB

-- | Capabilities needed to run a server for 'API'
data ServerCaps m r = ServerCaps
  { -- | Submit a new certification job
    submitJob :: !(EventBackendModifiers r r -> Maybe GitHubAccessToken -> FlakeRefV1 -> m RunIDV1)
  , -- | Get the status of all runs associated with a job
    getRuns :: !(EventBackendModifiers r r -> RunIDV1 -> ConduitT () RunStatusV1 m ())
  , -- | Delete all runs associated with a job
    abortRuns :: !(EventBackendModifiers r r -> RunIDV1 -> m ())
  , -- | Get the logs for all runs associated with a job
    getLogs :: !(EventBackendModifiers r r -> Maybe KnownActionType -> RunIDV1 -> ConduitT () RunLog m ())
  }

data CreateRunField
  = CreateRunRef !FlakeRefV1
  | CreateRunID !RunIDV1

data StartCertificationField
  = StartCertificationRunID !RunIDV1
  | StartCertificationIpfsCid !DB.IpfsCid

data GetRepoInfoField
  = GetRepoInfoOwner !Text
  | GetRepoInfoRepo !Text

  -- | CreateCertificationTxResponse !Wallet.TxResponse

data ServerEventSelector f where
  Version :: ServerEventSelector Void
  WalletAddress :: ServerEventSelector Void
  CreateRun :: ServerEventSelector CreateRunField
  GetRun :: ServerEventSelector Void
  AbortRun :: ServerEventSelector RunIDV1
  GetRunDetails :: ServerEventSelector RunIDV1
  GetRunLogs :: ServerEventSelector RunIDV1
  GetProfileBalance :: ServerEventSelector DB.ProfileId
  GetCertification :: ServerEventSelector RunIDV1
  GetRepoInfo :: ServerEventSelector GetRepoInfoField
  StartCertification :: ServerEventSelector StartCertificationField

renderServerEventSelector :: RenderSelectorJSON ServerEventSelector
renderServerEventSelector Version = ("version", absurd)
renderServerEventSelector WalletAddress = ("wallet-address", absurd)
renderServerEventSelector GetRun = ("get-run", absurd)
renderServerEventSelector AbortRun = ("abort-run", renderRunIDV1)
renderServerEventSelector GetRunLogs = ("get-run-logs", renderRunIDV1)
renderServerEventSelector GetRunDetails = ("get-run-details", renderRunIDV1)
renderServerEventSelector GetProfileBalance = ("get-profile-balance", renderProfileId)
renderServerEventSelector GetCertification = ("get-certification", renderRunIDV1)

renderServerEventSelector CreateRun = ("create-run", \case
    CreateRunRef fr -> ("flake-reference", toJSON $ uriToString id fr.uri "")
    CreateRunID rid -> ("run-id", toJSON rid)
  )

renderServerEventSelector StartCertification = ("start-certification", \case
    StartCertificationRunID rid -> ("run-id", toJSON rid)
    StartCertificationIpfsCid cid -> ("cid", toJSON cid)
  )

renderServerEventSelector GetRepoInfo = ("get-repo-info", \case
    GetRepoInfoOwner owner -> ("owner", toJSON owner)
    GetRepoInfoRepo repo -> ("repo", toJSON repo)
  )

renderRunIDV1 :: RenderFieldJSON RunIDV1
renderRunIDV1 rid = ("run-id",toJSON rid)

renderProfileId :: RenderFieldJSON DB.ProfileId
renderProfileId pid = ("profile-id",toJSON (show pid))

newtype UserAddress = UserAddress { unUserAddress :: Text}

type instance AuthServerData (AuthProtect "public-key") = (DB.ProfileId,UserAddress)

toDbStatus :: RunStatusV1 -> DB.Status
toDbStatus (Finished _)= DB.Succeeded
toDbStatus (Incomplete (Preparing Failed)) = DB.Failed
toDbStatus (Incomplete (Building Failed)) = DB.Failed
toDbStatus (Incomplete (Certifying (CertifyingStatus Failed _ _))) = DB.Failed
toDbStatus _ = DB.Queued

toCertificationResult :: RunStatusV1 -> Maybe CertificationResult
toCertificationResult (Finished rep)= Just rep
toCertificationResult _ = Nothing

dbSync :: (MonadIO m,MonadMask m) => UUID -> RunStatusV1 -> m RunStatusV1
dbSync uuid' status = do
  now <- getNow
  let dbStatus = toDbStatus status
  void $ DB.withDb $ case dbStatus of
    DB.Queued -> DB.syncRun uuid' now
    _ -> DB.updateFinishedRun uuid' (dbStatus == DB.Succeeded) now
  return status

getNow :: MonadIO m => m UTCTime
getNow = liftIO getCurrentTime

consumeRuns :: Monad m => ConduitT RunStatusV1 o (StateT IncompleteRunStatus m) RunStatusV1
consumeRuns = await >>= \case
  Nothing -> Incomplete <$> get
  Just (Incomplete s) -> do
    modify \s' -> case (s, s') of
      (_, Queued) -> s
      (Queued, _) -> s'

      (Preparing st, Preparing st') -> case compare st st' of
        LT -> s'
        _ -> s
      (_, Preparing _) -> s
      (Preparing _, _) -> s'

      (Building st, Building st') -> case compare st st' of
        LT -> s'
        _ -> s
      (_, Building _) -> s
      (Building _, _) -> s'

      (Certifying (CertifyingStatus st mp _), Certifying (CertifyingStatus st' mp' _)) -> case compare st st' of
        LT -> s'
        GT -> s
        EQ -> case (mp, mp') of
          (_, Nothing) -> s
          (Nothing, _) -> s'
          (Just p, Just p') -> case compare p.progressIndex p'.progressIndex of
            LT -> s'
            _ -> s
    consumeRuns
  Just s -> pure s
