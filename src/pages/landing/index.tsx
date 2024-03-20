import { useEffect, useState } from "react";

import { Box } from "@mui/material";

import ConnectSection from "./components/ConnectSection";
import SubscriptionSection from "./components/SubscriptionSection";
import RegisterSection from "./components/RegisterSection";
import RegisterModal from "./components/RegisterModal";
import PaymentDetailsVerification from "components/PaymentConfirmation/PaymentDetailsVerification";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchActiveSubscription } from "store/slices/auth.slice";
import { register, clear, payForRegister } from "store/slices/register.slice";
import type { Tier } from "store/slices/tiers.slice";
import type { RegisterForm } from "store/slices/register.slice";

import "./index.css";

export interface ISubscription {
  adaUsdPrice: number;
  endDate: string;
  features: {id: string, name: string}[];
  id: string;
  name: string;
  price: number;
  profileId: number;
  status: "active" | "inactive" | "pending";
  startDate: string;
  tierId: number;
  type: "developer" | "auditor"
}

export default function LandingPage() {
  const dispatch = useAppDispatch();
  const { wallet } = useAppSelector((state) => state.walletConnection);
  const { transactionId, processing, success } = useAppSelector((state) => state.register);

  const [step, setStep] = useState<string>('connect');
  const [selectedTier, setSelectedTier] = useState<Tier|null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [registerResponse, setRegisterResponse] = useState<any>(null);
  const [detailsToBeVerified, setDetailsToBeVerified] = useState<any>(null)
    
  useEffect(() => {
    if (wallet !== null && step === 'connect') {
      setStep('subscription');
    } else if (!wallet) {
      setStep('connect');
      setSelectedTier(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  
  const handleRegistration = async (form: RegisterForm) => {
    const response: any = await dispatch(register({ form, tierId: selectedTier!.id }));
    if (typeof response.payload !== 'string') {
      setRegisterResponse(response.payload);
      setDetailsToBeVerified({
        ...response.payload, 
        profile: form
      })
      setShowVerificationModal(true);
    } else {
      // do nothin;
    } 
  };

  const onPaymentDetailsVerified = async () => {
    setShowVerificationModal(false)
    await dispatch(payForRegister(registerResponse));
  }

  const handleContinue = () => {
    if (success) {
      dispatch(fetchActiveSubscription());
      dispatch(clear());
    }
  };

  return (
    <Box className="flex flex-row h-screen bg-cover bg-center bg-landing">
      { step === 'connect' && <ConnectSection /> }
      { step === 'subscription' && <SubscriptionSection onSelectTier={setSelectedTier}/> }
      { selectedTier !== null && <RegisterSection tier={selectedTier} onSubmit={handleRegistration} /> }
      <RegisterModal show={processing||success} onClose={handleContinue} success={success} transactionId={transactionId} />
      
      {showVerificationModal ? 
        <PaymentDetailsVerification onAccept={onPaymentDetailsVerified} data={detailsToBeVerified}/>
      : null}
    </Box>
  );
}