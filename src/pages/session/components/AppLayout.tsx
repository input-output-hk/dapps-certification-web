import React, { Suspense } from 'react';
import { Outlet, useNavigate } from "react-router-dom";

import { Box, CircularProgress, AppBar, Toolbar } from "@mui/material";

import NavBar from './NavBar';

import "../index.css";

const Banner = () => {
  // const { networkId } = useAppSelector((state) => state.auth);
  // const networkEnvVar: any = process.env.REACT_APP_WALLET_NETWORK

  // return (
  //   <>
  //     {networkId !== null && networkId !== 1 ? 
  //       // always show Info if not in Mainnet
  //       <Alert severity="info" style={{marginBottom: '10px'}}>Your connected wallet is not in Mainnet.</Alert> : null}
  //       {/* if not in Mainnet and app-wallet not Mainnet (i.e. in Testnet), show Warning to connect to Preprod. */}
  //     {networkId !== null && networkId !== 1 && networkEnvVar !== '1' ? 
  //       <Alert severity="warning">Your wallet is connected to a Testnet which is expected while the tool is in Beta. Please ensure that you are connected to the <strong>Preprod</strong> network.</Alert> : null}
  //   </>
  // );
  return null;
}

export default () => {
  const navigate = useNavigate();

  return (
    <Box className="flex flex-row h-screen bg-app">
      <NavBar />
      <Box className="flex-1 flex flex-col relative pt-16">
        <AppBar position="absolute" elevation={0} className="bg-white shadow">
          <Toolbar>

          </Toolbar>
        </AppBar>
        <Suspense fallback={<CircularProgress color="secondary" size={100} />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}