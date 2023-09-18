import React, { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "store/store";
import { connectWallet } from "store/slices/auth.slice";

import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress, Snackbar, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import "../index.css";

declare global {
  interface Window {
    cardano: any;
  }
}

const CardanoNS = window.cardano;

const ConnectSection = () => {
  const dispatch = useAppDispatch();
  const { loading, errorMessage, errorRetry, activeWallets } = useAppSelector(state => state.auth);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string|null>(null);

  const handleSelectWallet = (walletName: string) => {
    setWalletName(walletName);
    dispatch(connectWallet({ walletName }));
  }

  const handleRetry = () => {
    setShowError(false);
    dispatch(connectWallet({ walletName: walletName! }));
  }

  const handleCloseSnackbar = () => {
    setShowError(false);
    setWalletName(null);
  }

  useEffect(() => {
    if (errorMessage !== null) {
      setShowError(true);
      setShowModal(false);
    }
  }, [errorMessage]);

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
              onClick={() => setShowModal(true)}
            >
              Connect your wallet
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle className="pr-24">
          <span>Connect your wallet</span>
          <IconButton size="small" className="absolute top-4 right-4" onClick={() => setShowModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="flex flex-col items-center px-4 pt-4 pb-8 gap-4">
          {walletName ? null : !CardanoNS ? (
            <Typography>No wallet extensions installed yet!</Typography>
          ) : (
            activeWallets.map((walletName: string, index: number) =>
              CardanoNS && CardanoNS[walletName] ? (
                <div key={index} className="wallet-card" onClick={() => handleSelectWallet(walletName)}>
                  <img className="wallet-card-image" src={CardanoNS[walletName].icon} alt={CardanoNS[walletName].name} />
                  <span className="wallet-card-name">{CardanoNS[walletName].name}</span>
                </div>
              ) : null
            )
          )}
          {loading ? <CircularProgress color="secondary" size={50} /> : null}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={showError}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="error" variant="filled"
          onClose={handleCloseSnackbar}
          action={errorRetry && (
            <Button
              className="normal-case"
              color="inherit" size="small" variant="outlined"
              onClick={handleRetry}
            >
              Retry
            </Button>
          )}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ConnectSection;