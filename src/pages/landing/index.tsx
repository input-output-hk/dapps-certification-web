import React, { useEffect, useState } from "react";

import { Box } from "@mui/material";

import ConnectSection from "./components/ConnectSection";
import SubscriptionSection from "./components/SubscriptionSection";
import RegisterSection from "./components/RegisterSection";
import PaymentModal from "./components/PaymentModal";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchSession } from "store/slices/auth.slice";
import { register } from "store/slices/register.slice";
import type { Tier } from "./slices/tiers.slice";
import type { RegisterForm } from "store/slices/register.slice";

import "./index.css";

export default function LandingPage() {
  const dispatch = useAppDispatch();
  const { isConnected } = useAppSelector((state) => state.auth);
  const { success, transactionId } = useAppSelector((state) => state.register);

  const [step, setStep] = useState<string>('connect');
  const [selectedTier, setSelectedTier] = useState<Tier|null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isConnected && step === 'connect') {
      setStep('subscription');
      // TODO: START WATCHING FOR WALLET CHANGES
    }
  }, [isConnected]);

  useEffect(() => {
    if (success) setShowSuccess(true);
  }, [success]);

  const handleRegistration = (form: RegisterForm) => {
    dispatch(register({ form, tierId: selectedTier!.id }));
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    dispatch(fetchSession({}));
  };

  return (
    <Box className="flex flex-row h-screen bg-cover bg-center bg-landing">
      { step === 'connect' && <ConnectSection /> }
      { step === 'subscription' && <SubscriptionSection onSelectTier={setSelectedTier}/> }
      { selectedTier !== null && <RegisterSection tier={selectedTier} onSubmit={handleRegistration} /> }
      <PaymentModal show={showSuccess} onClose={handleSuccess} transactionId={transactionId!} />
    </Box>
  );
}