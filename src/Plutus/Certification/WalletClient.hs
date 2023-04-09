{-# LANGUAGE DataKinds                 #-}
{-# LANGUAGE BlockArguments            #-}
{-# LANGUAGE DeriveGeneric             #-}
{-# LANGUAGE TypeOperators             #-}
{-# LANGUAGE OverloadedStrings         #-}
{-# LANGUAGE ExistentialQuantification #-}
{-# LANGUAGE InstanceSigs              #-}
{-# LANGUAGE OverloadedRecordDot       #-}
{-# LANGUAGE QuasiQuotes               #-}
{-# LANGUAGE RecordWildCards           #-}
{-# LANGUAGE LambdaCase                #-}

module Plutus.Certification.WalletClient
  ( TxResponse(..)
  , TxId
  , Amount(..)
  , WalletArgs(..)
  , broadcastTransaction
  , getTransactionList
  , getWalletAddresses
  , CertificationMetadata(..)
  , WalletAddress
  , WalletTransaction(..)
  , Direction(..)
  , AddressState(..)
  , WalletAddressInfo(..)
  ) where

import           Control.Monad.IO.Class
import           Data.Aeson
import           Data.Aeson.QQ
import           Data.Proxy
import           Data.Text
import           Data.UUID
import           GHC.Generics
import           IOHK.Certification.Persistence
import           Network.HTTP.Client                           hiding (Proxy)
import           Network.HTTP.Client.TLS
import           Plutus.Certification.WalletClient.Transaction
import           Plutus.Certification.Internal
import           Servant.API
import           Servant.Client
import           Data.Maybe


data TxBody = forall a . (ToJSON a) => TxBody
  { passphrase :: !Text
  , address    :: !Text
  , metadata   :: !a
  }

instance ToJSON TxBody where
  toJSON :: TxBody -> Value
  toJSON (TxBody{..}) =
    [aesonQQ| {
        "passphrase": #{passphrase} ,
        "payments": [
            {
                "address": #{address},
                "amount": {
                    "quantity": 0,
                    "unit": "lovelace"
                }
            }
        ],
        "metadata": #{metadata}
    } |]

data Amount = Amount !Integer !Text deriving Show

instance FromJSON Amount where
  parseJSON = withObject "Amount" \o -> Amount
    <$> o .: "quantity"
    <*> o .: "unit"

instance ToJSON Amount where
  toJSON (Amount q u) = object [ "quantity" .= q  , "unit" .= u ]

data TxResponse = TxResponse
  { txRespAmount :: !Amount
  , txRespId     :: !TxId
  } deriving Show

instance FromJSON TxResponse where
  parseJSON = withObject "TxResponse" \o -> TxResponse
    <$> o .: "amount"
    <*> o .: "id"

instance ToJSON TxResponse where
  toJSON TxResponse{..}= object [ "amount" .= txRespAmount , "id" .= txRespId ]

type API = "v2" :> "wallets"
         :> Capture "wallet-id" Text
         :> ( TransactionsAPI :<|> AddressesAPI )

type TransactionsAPI = "transactions"
         :> ( ReqBody '[JSON] TxBody :> Verb 'POST 202 '[JSON] TxResponse
           :<|> Get '[JSON] [WalletTransaction]
           )
data AddressState = Used | Unused deriving Show

instance FromJSON AddressState where
  parseJSON = withText "AddressState" \case
    "used" -> pure Used
    "unused" -> pure Unused
    _ -> fail "Invalid AddressState"
type AddressesAPI = "addresses" :> QueryParam "state" AddressState :> Get '[JSON] [WalletAddressInfo]

instance ToHttpApiData AddressState where
  toUrlPiece :: AddressState -> Text
  toUrlPiece Used = "used"
  toUrlPiece Unused = "unused"

--http://localhost:8090/v2/wallets/73857344a0cf884fe044abfe85660cc9a81f6366/addresses?state=used
type WalletAddress = Text
data WalletArgs = WalletArgs
  { walletId         :: !Text
  , walletAddress    :: !WalletAddress
  --TODO: this might not be safe to be passed as a
  , walletPassphrase :: !Text
  , walletAPIAddress :: !BaseUrl
  , walletCertificationPrice :: !Int
  } deriving Show

data CertificationMetadata = CertificationMetadata
  { crtmId           :: !UUID
  , crtmIpfsCid      :: !IpfsCid
  , crtmProjectName  :: !Text
  , crtmLink         :: !(Maybe BaseUrl)
  , crtmTwitter      :: !(Maybe Text)
  , crtmContractLink :: !URI
  , crtmVersion      :: !Text
  } deriving Generic

instance ToJSON CertificationMetadata where
  toJSON CertificationMetadata{..} =  object $
    [ "id" .= crtmId
    , "ipfsCid" .= split64 (crtmIpfsCid.ipfsCid)
    , "projectName" .= split64 crtmProjectName
    , "contractLink" .= split64 (pack $ show crtmContractLink)
    , "version" .= split64 crtmVersion
    ] ++ maybe [] (\x -> [ "twitter" .= split64 x]) crtmTwitter
      ++ maybe [] (\x -> [ "link" .= (split64 . pack . showBaseUrl $ x )]) crtmLink

mkClient :: Text -> ((TxBody -> ClientM TxResponse) :<|> ClientM [WalletTransaction])
                    :<|> (Maybe AddressState -> ClientM [WalletAddressInfo])
mkClient = client (Proxy :: Proxy API)

mkSettings :: MonadIO m => BaseUrl -> m ClientEnv
mkSettings walletAPIAddress = liftIO $ do
  manager' <- newManager (if baseUrlScheme walletAPIAddress == Https then tlsManagerSettings else defaultManagerSettings)
  pure (mkClientEnv manager' walletAPIAddress)

broadcastTransaction :: (MonadIO m, ToJSON metadata)
                     => WalletArgs
                     -> Maybe WalletAddress
                     -> metadata
                     -> m (Either ClientError TxResponse)
broadcastTransaction WalletArgs{..} destAddr metadata = liftIO $ do
  settings <- mkSettings walletAPIAddress
  let (broadcastTx :<|> _) :<|> _ = mkClient walletId
  let body = TxBody walletPassphrase (fromMaybe walletAddress destAddr ) [aesonQQ| { "0": #{ metadata }} |]

  runClientM (broadcastTx body ) settings

getTransactionList :: (MonadIO m)
                   => WalletArgs
                   -> m (Either ClientError [WalletTransaction])
getTransactionList WalletArgs{..} = liftIO $ do
  settings <- mkSettings walletAPIAddress
  let (_ :<|> getList) :<|> _ = mkClient walletId
  runClientM getList settings

data WalletAddressInfo = WalletAddressInfo
  { derivationPath :: [Text]
  , addressId :: WalletAddress
  , addressState :: AddressState
  } deriving Show

instance FromJSON WalletAddressInfo where
  parseJSON = withObject "WalletAddressInfo" \o -> WalletAddressInfo
    <$> o .: "derivation_path"
    <*> o .: "id"
    <*> o .: "state"
getWalletAddresses :: (MonadIO m)
                   => WalletArgs
                   -> Maybe AddressState
                   -> m (Either ClientError [WalletAddressInfo])
getWalletAddresses WalletArgs{..} state = liftIO $ do
  settings <- mkSettings walletAPIAddress
  let (_ :<|> _) :<|> getAddressList = mkClient walletId
  runClientM (getAddressList state) settings
