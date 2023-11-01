import { useEffect, useState } from "react";

import { Box } from "@mui/material";

import ConnectSection from "./components/ConnectSection";
import SubscriptionSection from "./components/SubscriptionSection";
import RegisterSection from "./components/RegisterSection";
import RegisterModal from "./components/RegisterModal";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchSession } from "store/slices/auth.slice";
import { register, clear } from "store/slices/register.slice";
import type { Tier } from "./slices/tiers.slice";
import type { RegisterForm } from "store/slices/register.slice";

import "./index.css";

export default function LandingPage() {
  const dispatch = useAppDispatch();
  const { isConnected, wallet } = useAppSelector((state) => state.auth);
  const { transactionId, processing, success } = useAppSelector((state) => state.register);

  const [step, setStep] = useState<string>('connect');
  const [selectedTier, setSelectedTier] = useState<Tier|null>(null);

  useEffect(() => {
    if (isConnected && step === 'connect') {
      setStep('subscription');
    } else if (!isConnected && !wallet) {
      setStep('connect');
      setSelectedTier(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, wallet]);

  const handleRegistration = (form: RegisterForm) => {
    dispatch(register({ form, tierId: selectedTier!.id }));
  };

  const handleContinue = () => {
    if (success) {
      dispatch(fetchSession({}));
      dispatch(clear());
    }
  };

  return (
    <Box className="flex flex-row h-screen bg-cover bg-center bg-landing">
      { step === 'connect' && <ConnectSection /> }
      { step === 'subscription' && <SubscriptionSection onSelectTier={setSelectedTier}/> }
      { selectedTier !== null && <RegisterSection tier={selectedTier} onSubmit={handleRegistration} /> }
      <RegisterModal show={processing||success} onClose={handleContinue} success={success} transactionId={transactionId} />
    </Box>
  );
}