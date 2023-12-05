import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchActiveSubscription } from "store/slices/auth.slice";
import { fetchProfile } from "store/slices/profile.slice";

import AppLayout from './components/AppLayout';

import "./index.css";

const Session = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { hasAnActiveSubscription, isSessionFetched } = useAppSelector((state) => state.auth);
  const { profile, impersonate, retainId } = useAppSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchActiveSubscription(impersonate ? retainId : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasAnActiveSubscription)
      dispatch(fetchProfile(impersonate ? retainId : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnActiveSubscription]);

  useEffect(() => {
    if (location.pathname === '/' && hasAnActiveSubscription) {
      navigate('/home');
    }
    if (location.pathname !== '/' && isSessionFetched && !hasAnActiveSubscription) {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnActiveSubscription, isSessionFetched, location.pathname]);

  // If the session is being fetched or if the user has an active subscription and the profile is being fetched, a loading will be displayed
  if (!isSessionFetched || (isSessionFetched && hasAnActiveSubscription && profile === null) || (!hasAnActiveSubscription && location.pathname !== '/')) {
    return (
      <Box className="w-screen h-screen flex items-center justify-center bg-slate-app">
        <CircularProgress color="secondary" size={100} />
      </Box>
    );
  }

  return hasAnActiveSubscription ? <AppLayout /> : <Outlet />;
}

export default Session;
