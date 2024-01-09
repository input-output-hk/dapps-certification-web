import React, { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "store/store";
import { connectWallet } from "store/slices/walletConnection.slice";
import { showSnackbar, clearSnackbar } from "store/slices/snackbar.slice";

import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress, Snackbar, Alert, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import "../index.css";

declare global {
  interface Window {
    cardano: any;
  }
}

const CardanoNS = window.cardano;

const WalletSelection = (props: {
  walletName: string|null;
  activeWallets: string[];
  loading: boolean;
  handleSelectWallet: (walletName: string) => void;
}) => {
  const networkEnvVar = process.env.REACT_APP_WALLET_NETWORK;

  if (props.loading) return <CircularProgress color="secondary" size={60} className="my-2" />;
  if (props.walletName) return null;
  if (!CardanoNS) return <Typography className="my-2 text-base">No wallet extensions installed yet!</Typography>;

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      {networkEnvVar !== '1' && ( 
        <Grid item xs={12}>
          <Alert variant="outlined" severity="warning">
            This tool is in Beta, please ensure that you are connected to the <strong>Preprod</strong> network.
          </Alert>
        </Grid>
      )}
      { props.activeWallets.map((walletName: string, index: number) => CardanoNS && CardanoNS[walletName] ? (
        <Grid item key={index} xs={6}>
          <Button
            fullWidth variant="outlined"
            size="large" className="button-wallet"
            onClick={() => props.handleSelectWallet(walletName)}
          >
            <img
              className="button-wallet-image"
              src={CardanoNS[walletName].icon}
              alt={CardanoNS[walletName].name}
            />
            <span className="button-wallet-label">
              {CardanoNS[walletName].name}
            </span>
          </Button>
        </Grid>
      ) : null) }
    </Grid>
  );
}

const ConnectSection = () => {
  const dispatch = useAppDispatch();
  const { loading, errorMessage, errorRetry, activeWallets } = useAppSelector(state => state.walletConnection);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string|null>(null);

  const handleSelectWallet = (walletName: string) => {
    setWalletName(walletName);
    dispatch(connectWallet({ walletName }));
  }

  const handleRetry = () => {
    dispatch(clearSnackbar());
    dispatch(connectWallet({ walletName: walletName! }));
  }

  const handleCloseSnackbar = () => {
    setWalletName(null);
  }

  useEffect(() => {
    if (errorMessage !== null) {
      dispatch(showSnackbar({
        message: errorMessage,
        severity: 'error',
        onClose: handleCloseSnackbar,
        action: errorRetry ? {
          label: 'Retry',
          callback: handleRetry
        } : null
      }));
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
              className="py-3 px-4 font-medium button-contained-main"
              onClick={() => setShowModal(true)}
            >
              Connect your wallet
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog
        fullWidth
        maxWidth="sm"
        open={showModal}
        onClose={() => setShowModal(false)}
      >
        <DialogTitle className="pr-24">
          <span>Connect your wallet</span>
          <IconButton size="small" className="absolute top-4 right-4" onClick={() => setShowModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className="flex flex-col items-center px-4 py-5">
          <WalletSelection
            walletName={walletName}
            activeWallets={activeWallets}
            loading={loading}
            handleSelectWallet={handleSelectWallet}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ConnectSection;