import { useEffect, useState } from "react";

import { Box } from "@mui/material";

import ConnectSection from "./components/ConnectSection";
import SubscriptionSection from "./components/SubscriptionSection";
import RegisterSection from "./components/RegisterSection";
import RegisterModal from "./components/RegisterModal";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchActiveSubscription } from "store/slices/auth.slice";
import { register, clear, payForRegister, calculateFee } from "store/slices/register.slice";
import type { Tier } from "store/slices/tiers.slice";
import type { RegisterForm } from "store/slices/register.slice";

import "./index.css";
import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import PaymentDetailsVerification from "components/PaymentConfirmation/PaymentDetailsVerification";

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
  const { price } = useAppSelector((state) => state.price);
  const { profileBalance } = useAppSelector((state) => state.profile);

  const [step, setStep] = useState<string>('connect');
  const [selectedTier, setSelectedTier] = useState<Tier|null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [registerResponse, setRegisterResponse] = useState<any>(null);
  const [detailsToBeVerified, setDetailsToBeVerified] = useState<any>(null);
  const [submitForm, setSubmitForm] = useState<boolean>(false);
  const [form, setForm] = useState<RegisterForm>({ address: "", companyName: "", contactEmail: "", email: "", fullName: ""});
    
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
    if (selectedTier?.id) {
      setForm(form)
      const adaPrice: number = selectedTier.usdPrice / price;
      const lovelacesPrice: number = Math.round(adaPrice * 1000000); 
      const { lessBalance } = await calculateFee(lovelacesPrice, profileBalance);
      await setDetailsToBeVerified({
        subscription: {
          type: selectedTier.type,
          tierId: selectedTier.id,
          adaPrice: adaPrice.toFixed(2),
          usdPrice: selectedTier.usdPrice
        },
        balance: !lessBalance ? Math.round(profileBalance*100/1000000) / 100 : null,
        profile: form
      })
      await setShowVerificationModal(true);
    } 
  };

  const onPaymentDetailsVerified = async () => {
    setShowVerificationModal(false)
    const response: any = await dispatch(register({ form, tierId: selectedTier!.id }));
    if (response?.payload?.subscription) {
      setRegisterResponse(response.payload); 
      await dispatch(payForRegister(response.payload));
      setSubmitForm(true)
    } else {
      // do nothing;
    }
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
      { selectedTier !== null && <RegisterSection tier={selectedTier} onClickPay={handleRegistration} submitForm={submitForm} /> }
      <RegisterModal show={processing||success} onClose={handleContinue} success={success} transactionId={transactionId} />
      
      {showVerificationModal ? 
        <PaymentDetailsVerification onAccept={onPaymentDetailsVerified} data={detailsToBeVerified}/>
      : null}
    </Box>
  );
}