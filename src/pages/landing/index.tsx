import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box } from "@mui/material";

import ConnectSection from "./components/ConnectSection";
import SubscriptionSection from "./components/SubscriptionSection";
import RegisterSection from "./components/RegisterSection";

import { useAppDispatch, useAppSelector } from "store/store";
import { register } from "store/slices/register.slice";
import type { Tier } from "./slices/tiers.slice";
import type { RegisterForm } from "store/slices/register.slice";

import "./index.css";

export default function LandingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const { success, processing } = useAppSelector((state) => state.register);

  const [step, setStep] = useState<string>('connect');
  const [selectedTier, setSelectedTier] = useState<Tier|null>(null);

  useEffect(() => {
    if (isLoggedIn && step === 'connect') {
      setStep('subscription');
      // TODO: START WATCHING FOR WALLET CHANGES
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (success) {
      navigate('/home');
    }
  }, [success]);

  const handleRegistration = (form: RegisterForm) => {
    dispatch(register({ form, tierId: selectedTier!.id }));
  };

  return (
    <Box className="flex flex-row h-screen bg-cover bg-center bg-landing">
      { step === 'connect' && <ConnectSection /> }
      { step === 'subscription' && <SubscriptionSection onSelectTier={setSelectedTier}/> }
      { selectedTier !== null && <RegisterSection tier={selectedTier} processing={processing} onSubmit={handleRegistration} /> }
    </Box>
  );
}