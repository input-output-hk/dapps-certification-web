import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Alert, CircularProgress } from "@mui/material";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchSession } from "store/slices/auth.slice";

import "./index.css";

const Banner = () => {
  const { networkId } = useAppSelector((state) => state.auth);
  const networkEnvVar: any = process.env.REACT_APP_WALLET_NETWORK

  return (
    <>
      {networkId !== null && networkId !== 1 ? 
        // always show Info if not in Mainnet
        <Alert severity="info" style={{marginBottom: '10px'}}>Your connected wallet is not in Mainnet.</Alert> : null}
        {/* if not in Mainnet and app-wallet not Mainnet (i.e. in Testnet), show Warning to connect to Preprod. */}
      {networkId !== null && networkId !== 1 && networkEnvVar !== '1' ? 
        <Alert severity="warning">Your wallet is connected to a Testnet which is expected while the tool is in Beta. Please ensure that you are connected to the <strong>Preprod</strong> network.</Alert> : null}
    </>
  );
}

const PageLayout = () => {
  return (
    <Suspense fallback={<CircularProgress color="secondary" size={100} />}>
      <Outlet />
    </Suspense>
  );
};

export default () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { hasAnActiveSubscription, isSessionFetched } = useAppSelector((state) => state.auth);

  useEffect(() => { dispatch(fetchSession({})); }, []);

  useEffect(() => {
    if (location.pathname === '/' && hasAnActiveSubscription) {
      navigate('/home');
    }
    if (location.pathname !== '/' && isSessionFetched && !hasAnActiveSubscription) {
      navigate('/');
    }
  }, [hasAnActiveSubscription, isSessionFetched, location.pathname]);

  if (!isSessionFetched) {
    return (
      <Box className="w-screen h-screen flex items-center justify-center">
        <CircularProgress color="secondary" size={100} />
      </Box>
    );
  }

  return hasAnActiveSubscription ? <PageLayout /> : <Outlet />;
}