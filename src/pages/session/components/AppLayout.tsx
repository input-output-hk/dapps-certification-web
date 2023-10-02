import React from 'react';
import { Outlet } from "react-router-dom";

import { LocalStorageKeys } from "constants/constants";

import { Box, Alert } from "@mui/material";

import AppBar from './AppBar';
import NavBar from './NavBar';

import "../index.css";

const Banner = () => {
  const networkId = localStorage.getItem(LocalStorageKeys.networkId);
  const networkEnvVar = process.env.REACT_APP_WALLET_NETWORK;

  return networkId === '0' ? (
    <Box className="flex-0 pt-4 px-4">
      {networkId === '0' && (
        <Alert variant="outlined" severity="info">Your connected wallet is not in Mainnet.</Alert>
      )}
      {networkId === '0' && networkEnvVar !== '1' && ( 
        <Alert variant="outlined" severity="warning" className="mt-4">
          Your wallet is connected to a Testnet which is expected while the tool is in Beta. Please ensure that you are connected to the <strong>Preprod</strong> network.
        </Alert>
      )}
    </Box>
  ) : null;
}

const AppLayout = () => (
  <Box className="flex flex-row h-screen bg-slate-app overflow-hidden">
    <NavBar />
    <Box className="flex-1 flex flex-col relative overflow-y-auto">
      <AppBar />
      <Banner />
      <Box className="flex-1 flex flex-col p-4">
        <Outlet />
      </Box>
    </Box>
  </Box>
);

export default AppLayout;