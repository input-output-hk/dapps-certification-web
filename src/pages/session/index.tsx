import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchSession } from "store/slices/auth.slice";

import AppLayout from './components/AppLayout';

import "./index.css";

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
      <Box className="w-screen h-screen flex items-center justify-center bg-slate-app">
        <CircularProgress color="secondary" size={100} />
      </Box>
    );
  }

  return hasAnActiveSubscription ? <AppLayout /> : <Outlet />;
}