import React, { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";

import { Container, Box, Typography, Button, TextField } from "@mui/material";
import ConnectWallet from "components/ConnectWallet/ConnectWallet";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchPrice } from "./slices/price.slice";
import { fetchTiers } from "./slices/tiers.slice";

import type { Tier } from "./slices/tiers.slice";

import "./Landing.css";
import { stat } from "fs";

const REFRESH_TIME = 30;

const ConnectSection = () => (
  <Box className="flex flex-row-reverse flex-1">
    <Box className="white-box justify-center">
      <Box className="text-center">
        <Typography variant="h3" className="title-text mb-4">
          Testing Tool
        </Typography>
        <Typography variant="h6" className="subtitle-text mb-40">
          Connect your in-browser wallet to login/sign-up
        </Typography>
        <ConnectWallet />
      </Box>
    </Box>
  </Box>
);

const SubscriptionSection = (props: { tiers: Tier[], tierId: string|null, onSelect: (tierId: string) => void }) => (
  <Box className="white-box pt-24">
    <Box className="text-center">
      <Typography variant="h4" className="title-text mb-2">
        Testing Tool
      </Typography>
      <Typography variant="subtitle1" className="subtitle-text mb-16">
        Please choose a subscription
      </Typography>
      <Box className="flex flex-row px-2">
        {props.tiers.map(tier => (
          <div key={tier.id} className={props.tierId === tier.id ? 'package-type-active' : 'package-type'}>
            <Typography variant="h5" className="font-bold my-8">
              {tier.name}<br/>Premium Tier
            </Typography>
            <Typography variant="h2" className="font-normal mb-24">
              ${tier.usdPrice.toFixed(2)}
            </Typography>
            <Typography variant="body1" className="font-bold">
              {tier.subtitle}
            </Typography>
            <Typography variant="body1" className="font-normal mb-12">
              {tier.features.map(feature => (
                <span key={feature.name}>{feature.name}<br/></span>
              ))}
            </Typography>
            <Button
              variant="contained"
              size="large"
              className="py-3 px-14"
              color={!props.tierId || props.tierId === tier.id ? 'info' : 'primary'}
              onClick={() => props.onSelect(tier.id)}
            >
              {props.tierId === tier.id ? 'Selected' : 'Select'}
            </Button>
          </div>
        ))}
      </Box>
    </Box>
  </Box>
);

const RegisterSection = (props: { tierId: string, count: number, price: number, onSubmit: (event: React.SyntheticEvent) => void }) => (
  <Box className="white-box pt-24 text-center">
    <Typography variant="h4" className="title-text mb-2">
      Auditor profile
    </Typography>
    <Typography variant="subtitle1" className="subtitle-text mb-16">
      Please complete your user profile information
    </Typography>
    <Container maxWidth="sm">
      <form onSubmit={props.onSubmit}>
        <TextField
          className="mb-6"
          required fullWidth variant="standard"
          label="Company name" name="company" type="text"
        />
        <TextField
          className="mb-6"
          required fullWidth variant="standard"
          label="Email" name="email" type="email"
        />
        <TextField
          className="mb-6"
          required fullWidth variant="standard"
          label="Address" name="address" type="text"
        />
        <TextField
          className="mb-6"
          required fullWidth variant="standard"
          label="City, zip code" name="city" type="text"
        />
        <TextField
          className="mb-6"
          required fullWidth variant="standard"
          label="Country" name="country" type="text"
        />
        <TextField
          className="mb-6"
          fullWidth variant="standard"
          label="Twitter" name="twitter" type="text"
        />
        <TextField
          className="mb-6"
          fullWidth variant="standard"
          label="LinkedIn" name="linkedin" type="text"
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          className="mt-8 py-3 px-14 normal-case"
        >
          Pay (₳{props.price.toFixed(2)})
        </Button>
        <Typography variant="body1" className="price-text">
          Price will refresh in {props.count} second{props.count === 1 ? '' : 's'}
        </Typography>
      </form>
    </Container>
  </Box>
);

export default function LandingPage() {
  const { price } = useAppSelector((state) => state.price);
  const { tiers } = useAppSelector((state) => state.tiers);
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<string>('connect');
  const [tierId, setTierId] = useState<string|null>(null);
  const [count, setCount] = useState<number>(0);

  const handleFormSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      company: { value: FormData };
      email: { value: FormData };
      address: { value: FormData };
      city: { value: FormData };
      country: { value: FormData };
      twitter: { value: FormData };
      linkedin: { value: FormData };
    };
    console.log({
      company: target.company.value,
      email: target.email.value,
      address: target.address.value,
      city: target.city.value,
      country: target.country.value,
      twitter: target.twitter.value,
      linkedin: target.linkedin.value
    });
  }

  useEffect(() => { dispatch(fetchTiers({})); }, []);

  useEffect(() => {
    if (isLoggedIn && step === 'connect') {
      setStep('subscription');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (tierId !== null) {
      setCount(REFRESH_TIME);
      dispatch(fetchPrice());
    }
  }, [tierId]);

  useInterval(
    () => {
      if (count <= 0) {
        setCount(REFRESH_TIME);
        dispatch(fetchPrice());
      } else {
        setCount(count - 1);
      }
    },
    tierId !== null ? 1000 : null
  );

  return (
    <Box
      className="flex flex-row h-screen bg-cover bg-center"
      sx={{ backgroundImage: 'url(/images/landing-background.png)' }}
    >
      { step === 'connect' && <ConnectSection /> }
      { step === 'subscription' && <SubscriptionSection tiers={tiers} tierId={tierId} onSelect={setTierId}/> }
      { tierId !== null && <RegisterSection tierId={tierId} count={count} price={price} onSubmit={handleFormSubmit} /> }
    </Box>
  );
}