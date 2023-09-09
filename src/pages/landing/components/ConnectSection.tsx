import React, { useEffect, useState, useCallback } from "react";
import useLocalStorage from "hooks/useLocalStorage";

import { Address } from "@emurgo/cardano-serialization-lib-browser";
import { AxiosResponse } from "axios";

import { LocalStorageKeys } from "constants/constants";
import { fetchData } from "api/api";
import { useAppDispatch } from "store/store";
import { logout } from "store/slices/auth.slice";

import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress, Snackbar, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import "../index.css";

declare global {
  interface Window {
    cardano: any;
  }
}

const CardanoNS = window.cardano;

export default () => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [errorToast, setErrorToast] = useState<{display: boolean; statusText?: string; message?: string; showRetry?: boolean}>({display: false});

  const openConnectWalletModal = useCallback(() => setIsOpen(true), []);
  const onCloseModal = useCallback(() => setIsOpen(false), []);

  const retryConnectWallet = () => {
    setErrorToast({ display: false });
    openConnectWalletModal();
  }

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
        autoHideDuration={3000}
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
