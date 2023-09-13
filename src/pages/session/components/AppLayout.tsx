import React, { useEffect } from 'react';
import { Outlet } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchProfile } from "store/slices/auth.slice";

import { Box, Alert } from "@mui/material";

import AppBar from './AppBar';
import NavBar from './NavBar';

import "../index.css";

const Banner = () => {
  const { networkId } = useAppSelector((state) => state.auth);
  const networkEnvVar = process.env.REACT_APP_WALLET_NETWORK;

  if (networkId === null || networkId === 1) return null;

  return (
    <Box className="flex-0 pt-4 px-4">
      <Alert variant="outlined" severity="info">Your connected wallet is not in Mainnet.</Alert>
      {networkEnvVar !== '1' && ( 
        <Alert variant="outlined" severity="warning" className="mt-4">
          Your wallet is connected to a Testnet which is expected while the tool is in Beta. Please ensure that you are connected to the <strong>Preprod</strong> network.
        </Alert>
      )}
    </Box>
  );
}

const AppLayout = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProfile({}));
  }, []);

  return (
    <Box className="flex flex-row h-screen bg-app">
      <NavBar />
      <Box className="flex-1 flex flex-col relative pt-16">
        <AppBar />
        <Banner />
        <Box className="flex-1 flex flex-col p-4">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AppLayout;