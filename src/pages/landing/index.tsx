import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box } from "@mui/material";

import ConnectSection from "./components/ConnectSection";
import SubscriptionSection from "./components/SubscriptionSection";
import RegisterSection from "./components/RegisterSection";

import { useAppDispatch, useAppSelector } from "store/store";
import { register } from "./slices/registration.slice";
import type { Tier } from "./slices/tiers.slice";
import type { RegistrationForm } from "./components/RegisterSection";

import "./index.css";

export default function LandingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const { success } = useAppSelector((state) => state.registration);

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

  const handleRegistration = (form: RegistrationForm) => {
    dispatch(register({ form, tierId: selectedTier!.id }));
  };

  return (
    <Box className="flex flex-row h-screen bg-cover bg-center bg-landing">
      { step === 'connect' && <ConnectSection /> }
      { step === 'subscription' && <SubscriptionSection onSelectTier={setSelectedTier}/> }
      { selectedTier !== null && <RegisterSection tier={selectedTier} onSubmit={handleRegistration} /> }
    </Box>
  );
}