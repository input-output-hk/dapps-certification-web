import React, { useEffect, useState, useCallback } from "react";
import useLocalStorage from "hooks/useLocalStorage";

import { Address } from "@emurgo/cardano-serialization-lib-browser";
import { AxiosResponse } from "axios";

import { LocalStorageKeys } from "constants/constants";
import { fetchData } from "api/api";
import { useAppDispatch } from "store/store";
import { getProfileDetails, logout, setNetwork } from "store/slices/auth.slice";

import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress, Snackbar, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import "../index.css";

const wallets: string[] = ["lace", "nami", "yoroi"];

declare global {
  interface Window {
    cardano: any;
  }
}

const CardanoNS = window.cardano;

export default () => {
  const dispatch = useAppDispatch();
  const [wallet, setWallet] = useState(null);
  const [walletName, setWalletName] = useState("");
  const [address, setAddress] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [errorToast, setErrorToast] = useState<{display: boolean; statusText?: string; message?: string; showRetry?: boolean}>({display: false});
  const [walletLoading, setWalletLoading] = useState(false);
  const [, setIsLoggedIn] = useLocalStorage(
    LocalStorageKeys.isLoggedIn,
    localStorage.getItem(LocalStorageKeys.isLoggedIn) === "true" ? true : false
  );

  const [, setUserDetails] = useLocalStorage(
    LocalStorageKeys.userDetails,
    localStorage.getItem(LocalStorageKeys.userDetails)
      ? JSON.parse(localStorage.getItem(LocalStorageKeys.userDetails)!)
      : null
  );

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
          const response = await enabledWallet.getChangeAddress();
          const walletAddr = Address.from_bytes(
            Buffer.from(response, "hex")
          ).to_bech32();
          initiatePrivateWalletSignature(enabledWallet, walletAddr, response);
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
        showRetry: error.code === 3
      });
    } else if (error.response) {
      setErrorToast({
        display: true, 
        statusText: error.response.statusText, 
        message: error.response.data || undefined,
        showRetry: error.status === 403
      });
    } else {
      setErrorToast({display: true})
      setTimeout(() => {
        setErrorToast({ display: false });
      }, 3000);
    }
    setIsLoggedIn(false);
    setUserDetails({ dapp: null });
  };

  const catchError = (err: any) => {
    handleError(err);
    setWalletLoading(false);
    dispatch(logout());
  }

  const initiatePrivateWalletSignature = async (currentWallet: any, walletAddr_bech32: any, walletAddr: string) => {
    const timestamp = (await fetchData.get<any,AxiosResponse<number>,any>('/server-timestamp')).data;
    const msgToBeSigned = `Sign this message if you are the owner of the ${walletAddr_bech32} address. \n Timestamp: <<${timestamp}>> \n Expiry: 60 seconds`;
    try {
      const {key, signature} = await currentWallet.signData(walletAddr, Buffer.from(msgToBeSigned, 'utf8').toString('hex'))
      if (key && signature) {
        const token = (await fetchData.post<any,AxiosResponse<string>,any>('/login', {
          address: walletAddr_bech32,
          key: key,
          signature: signature
        })).data;
        localStorage.setItem(LocalStorageKeys.authToken, token);
        setAddress(walletAddr_bech32);
      } else {
        catchError({ message: "Could not obtain the proper key and signature for the wallet. Please try connecting again." });
      }
    } catch (err) {
      catchError(err);
    }
  }

  useEffect(() => {
    if (address) {
      (async () => {
        try {
          const response: any = await dispatch(
            getProfileDetails({
              address: address,
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
      <Box className="flex flex-row-reverse flex-1">
        <Box className="white-box justify-center">
          <Box className="text-center">
            <Typography variant="h4" className="title-text mb-2">
              Testing Tool
            </Typography>
            <Typography variant="subtitle1" className="subtitle-text mb-32">
              Connect your in-browser wallet to login/sign-up
            </Typography>
            <Button
              variant="contained" size="large"
              className="py-3 px-4 normal-case font-medium bg-main"
              onClick={openConnectWalletModal}
            >
              Connect your wallet
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog open={isOpen} onClose={onCloseModal}>
        <DialogTitle className="pr-24">
          <span>Connect your wallet</span>
          <IconButton size="small" className="absolute top-4 right-4" onClick={onCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="flex flex-col items-center px-4 pt-4 pb-8 gap-4">
          {wallet ? null : !CardanoNS ? (
            <Typography>No wallet extensions installed yet!</Typography>
          ) : (
            wallets.map((wallet: string, index: number) =>
              CardanoNS && CardanoNS[wallet] ? (
                <div key={index} className="wallet-card" onClick={(_) => loadWallet(wallet)}>
                  <img className="wallet-card-image" src={CardanoNS[wallet].icon} alt={CardanoNS[wallet].name} />
                  <span className="wallet-card-name">{CardanoNS[wallet].name}</span>
                </div>
              ) : null
            )
          )}
          {walletLoading ? <CircularProgress color="secondary" size={50} /> : null}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={errorToast.display}
        onClose={() => setErrorToast({ display: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="error" variant="filled"
          onClose={() => setErrorToast({ display: false })}
          action={errorToast.showRetry && (
            <Button
              className="normal-case"
              color="inherit" size="small" variant="outlined"
              onClick={retryConnectWallet}
            >
              Retry
            </Button>
          )}
        >
          {errorToast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
