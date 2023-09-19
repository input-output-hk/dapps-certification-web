import { useEffect, useState, useCallback } from "react";
import { Address,BaseAddress,RewardAddress } from "@emurgo/cardano-serialization-lib-browser";
import { useAppDispatch } from "store/store";
import { getProfileDetails, logout, setNetwork } from "store/slices/auth.slice";

import Modal from "components/Modal/Modal";
import Button from "components/Button/Button";
import Loader from "components/Loader/Loader";

import "./ConnectWallet.scss";
import { fetchData } from "api/api";
import useLocalStorage from "hooks/useLocalStorage";
import { AxiosResponse } from "axios";
import { LocalStorageKeys } from 'constants/constants';

const wallets: Array<string> = ["lace", "nami", "yoroi"];

declare global {
  interface Window {
    cardano: any;
  }
}

// hex string
export type StakeAddressHex = string;
export type StakeAddressBech32 = `stake${string}`;
export type ChangeAddressBech32 = `addr${string}`;

export const getAddresses = async (wallet: any): Promise<[StakeAddressHex, StakeAddressBech32,ChangeAddressBech32]> => {
  const networkId = await wallet.getNetworkId();
  const changeAddrHex = await wallet.getChangeAddress();

  // derive the stake address from the change address to be sure we are getting
  // the stake address of the currently active account.
  const changeAddress = Address.from_bytes( Buffer.from(changeAddrHex, 'hex') );
  const baseChangeAddress = BaseAddress.from_address(changeAddress);
  if(!baseChangeAddress) throw new Error(`Could not derive base address from change address: ${changeAddrHex}`)
  const stakeCredential = baseChangeAddress?.stake_cred();
  if(!stakeCredential) throw new Error(`Could not derive stake credential from change address: ${changeAddrHex}`)
  const stakeAddress = RewardAddress.new(networkId, stakeCredential).to_address();

  return [
    stakeAddress.to_hex(),
    stakeAddress.to_bech32() as StakeAddressBech32,
    baseChangeAddress.to_address().to_bech32() as ChangeAddressBech32
  ];
}
let CardanoNS = window.cardano;

const ConnectWallet = () => {
  const dispatch = useAppDispatch();
  const [wallet, setWallet] = useState(null);
  const [walletName, setWalletName] = useState("");
  const [address, setAddress] = useState(null as ChangeAddressBech32 | null)
  const [isOpen, setIsOpen] = useState(false);
  const [errorToast, setErrorToast] = useState<{display: boolean; statusText?: string; message?: string; showRetry?: boolean}>({display: false});
  const [walletLoading, setWalletLoading] = useState(false);
  
  const [, setIsLoggedIn] = useLocalStorage(LocalStorageKeys.isLoggedIn, false);
  const [, setUserDetails, removeUserDetails] = useLocalStorage(LocalStorageKeys.userDetails, null);

  const openConnectWalletModal = useCallback(() => setIsOpen(true), []);

  const onCloseModal = useCallback(() => setIsOpen(false), []);

  const retryConnectWallet = () => {
    setWallet(null)
    setErrorToast({ display: false });
    openConnectWalletModal()
  }

  const loadWallet = async (walletName: string) => {
    try {
      setWalletLoading(true);
      const enabledWallet = await CardanoNS[walletName].enable();
      enabledWallet.getNetworkId().then(async (data: number) => {
        dispatch(setNetwork(data));
        setWallet(enabledWallet);
        setWalletName(walletName);
        if (enabledWallet) {
          const [stakeAddrHex, stakeAddrBech32,changeAddress] = await getAddresses(enabledWallet);
          initiatePrivateWalletSignature(enabledWallet,  stakeAddrBech32, stakeAddrHex,changeAddress);
        }
      });
    } catch (e) {
      handleError(e);
    }
  };

  const handleError = (error: any) => {
    if (error.info) {
      setErrorToast({
          display: true,
          message: error.info,
          showRetry: error.code === 3})
    } else if (error.response) {
        setErrorToast({
            display: true,
            statusText: error.response.statusText,
            message: error.response.data || undefined,
            showRetry: error.status === 403
        })
    } else {
      setErrorToast({display: true})
      setTimeout(() => {
        setErrorToast({ display: false });
      }, 3000);
    }
    setIsLoggedIn(false);
    removeUserDetails();
  };

  const catchError = (err: any) => {
    handleError(err)
    setWalletLoading(false)
    dispatch(logout())
  }

  const initiatePrivateWalletSignature = async (
    currentWallet: any,
    stakeAddressBech32: StakeAddressBech32,
    stakeAddressHex: StakeAddressHex,
    changeAddressBech32: ChangeAddressBech32
  ) => {
    const timestamp = (await fetchData.get<any,AxiosResponse<number>,any>('/server-timestamp')).data;
    const msgToBeSigned = `Sign this message if you are the owner of the ${changeAddressBech32} address. \n Timestamp: <<${timestamp}>> \n Expiry: 60 seconds`;
    try {
        const {key, signature} = await currentWallet.signData(stakeAddressHex, Buffer.from(msgToBeSigned, 'utf8').toString('hex'))
        if (key && signature) {
            const token = (await fetchData.post<any,AxiosResponse<string>,any>('/login', {
                address: stakeAddressBech32,
                key: key,
                signature: signature
            })).data;
            localStorage.setItem(LocalStorageKeys.authToken, token)
            setAddress(changeAddressBech32)
        } else {
            catchError({ message: "Could not obtain the proper key and signature for the wallet. Please try connecting again." })
        }
    } catch (err) {
        catchError(err)
    }
  }

  useEffect(() => {
    if (address) {
      (async () => {
        try {
          const response: any = await dispatch(
            getProfileDetails({
              address: address,
              stakeAddress: address,
              wallet: wallet,
              walletName: walletName,
            })
          ).catch(handleError);
          setUserDetails(response.payload);
          setIsLoggedIn(true);
          setWalletLoading(false);
        } catch (error) {
          setWalletLoading(false);
          handleError(error);
          // dispatch(clearCache())
        }
      })();
    }
    // eslint-disable-next-line
  }, [dispatch, address, wallet, walletName]);

  return (
    <>
      <Button
        type="button"
        displayStyle="gradient"
        buttonLabel={"Connect Wallet"}
        onClick={openConnectWalletModal}
      />
      <Modal open={isOpen} title="Connect a wallet" onCloseModal={onCloseModal}>
        <div id="walletsContainer">
          {wallet ? null : !CardanoNS ? (
            <span>No wallet extensions installed yet!</span>
          ) : (
            wallets.map((wallet: string, index: number) => {
              if (CardanoNS && CardanoNS[wallet]) {
                return (
                  <div
                    className="card"
                    key={index}
                    onClick={(_) => loadWallet(wallet)}
                  >
                    <img
                      src={CardanoNS[wallet].icon}
                      alt={CardanoNS[wallet].name}
                    />
                    <span>{CardanoNS[wallet].name}</span>
                  </div>
                );
              } else {
                return null;
              }
            })
          )}
          {walletLoading ? <Loader /> : null}
          {errorToast?.display ? (<>
            <span className="error">{errorToast.message}</span>
            <span className="link" style={{marginLeft: '5px'}} onClick={retryConnectWallet}>Retry</span>
          </>) : null}
        </div>
      </Modal>
    </>
  );
};

export default ConnectWallet;
