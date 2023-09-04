import React, { useState } from "react";

import { Container, Box, Typography, Button, TextField } from "@mui/material";

import "./Landing.css";

const ConnectSection = (props: { onSubmit: () => void }) => (
  <Box className="flex flex-row-reverse flex-1">
    <Box className="flex flex-col justify-center m-0 min-w-[50vw] bg-white">
      <Box className="text-center">
        <Typography variant="h3" className="font-bold mb-4 tracking-[.2em]">
          Certifyr.io
        </Typography>
        <Typography variant="h6" className="font-normal mb-40 text-[#A6A7AD]">
          Connect your in-browser wallet to login/sign-up
        </Typography>
        <Button variant="contained" size="large" className="py-3 px-4 normal-case font-medium" onClick={props.onSubmit}>
          Connect your wallet
        </Button>
      </Box>
    </Box>
  </Box>
);

const SubscriptionSection = (props: { packageType: string|null, onSelect: (packageType: string) => void }) => (
  <Box className="flex flex-col m-0 pt-24 min-w-[50vw] bg-white">
    <Box className="text-center">
      <Typography variant="h4" className="font-bold mb-2 tracking-[.2em]">
        Certifyr.io
      </Typography>
      <Typography variant="subtitle1" className="font-normal mb-16 text-[#A6A7AD]">
        Please choose the Package you wish to subscribe to.
      </Typography>
      <Box className="flex flex-row px-2">
        <Box className={props.packageType === 'developer' ? 'package-type-active' : 'package-type'}>
          <Typography variant="h5" className="font-bold my-8">
            Developer<br/>Premium Tier
          </Typography>
          <Typography variant="h2" className="font-normal mb-24">
            $999
          </Typography>
          <Typography variant="body1" className="font-bold">
            Limited testing features
          </Typography>
          <Typography variant="body1" className="font-normal mb-12">
            Limited number of checks<br />Limited number of properties<br />Low priority queue
          </Typography>
          <Button
            variant="contained"
            size="large"
            className="py-3 px-14"
            color={!props.packageType || props.packageType === 'developer' ? 'info' : 'primary'}
            onClick={() => props.onSelect('developer')}
          >
            {props.packageType === 'developer' ? 'Selected' : 'Select'}
          </Button>
        </Box>
        <Box className={props.packageType === 'auditor' ? 'package-type-active' : 'package-type'}>
          <Typography variant="h5" className="font-bold my-8">
            Auditor<br/>Premium Tier
          </Typography>
          <Typography variant="h2" className="font-normal mb-24">
            $9,999
          </Typography>
          <Typography variant="body1" className="font-bold">
            Unlimited testing features
          </Typography>
          <Typography variant="body1" className="font-normal mb-12">
            Unlimited number of checks<br />Unlimited number of properties<br />High priority queue
          </Typography>
          <Button
            variant="contained"
            size="large"
            className="py-3 px-14"
            color={!props.packageType || props.packageType === 'auditor' ? 'info' : 'primary'}
            onClick={() => props.onSelect('auditor')}
          >
            {props.packageType === 'auditor' ? 'Selected' : 'Select'}
          </Button>
        </Box>
      </Box>
    </Box>
  </Box>
);

const RegisterSection = (props: { packageType: string, onSubmit: (event: React.SyntheticEvent) => void }) => (
  <Box className="flex flex-col m-0 pt-24 min-w-[50vw] bg-white text-center">
    <Typography variant="h4" className="font-bold mb-2 tracking-[.2em] capitalize">
      {`${props.packageType} profile`}
    </Typography>
    <Typography variant="subtitle1" className="font-normal mb-16 text-[#A6A7AD]">
      Please complete the information to create your account.
    </Typography>
    <Container maxWidth="sm">
      <form onSubmit={props.onSubmit}>
        <TextField
          className="mb-6"
          required fullWidth variant="standard"
          label="DApp subject name" name="subject" type="text"
        />
        <TextField
          className="mb-6"
          required fullWidth variant="standard"
          label="GitHub Repository" name="repository" type="text"
        />
        <TextField
          className="mb-6"
          required fullWidth variant="standard"
          label="Full Name" name="fullName" type="text"
        />
        <TextField
          className="mb-6"
          required fullWidth variant="standard"
          label="Contact email" name="email" type="email"
        />
        <TextField
          className="mb-6"
          fullWidth variant="standard"
          label="Website" name="website" type="url"
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
          onClick={props.onSubmit}
        >
          Pay (₳3,181.08)
        </Button>
      </form>
    </Container>
  </Box>
);

export default function LandingPage() {
  const [step, setStep] = useState<string>('connect');
  const [packageType, setPackageType] = useState<string|null>(null);

  const handleFormSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      subject: { value: string };
      repository: { value: string };
      fullName: { value: string };
      email: { value: string };
      website: { value: string };
      twitter: { value: string };
      linkedin: { value: string };
    };
    console.log({
      subject: target.subject,
      repository: target.repository,
      fullName: target.fullName,
      email: target.email,
      website: target.website,
      twitter: target.twitter,
      linkedin: target.linkedin
    });
  }

  return (
    <Box
      className="flex flex-row h-screen bg-cover bg-center"
      sx={{ backgroundImage: 'url(/images/landing-background.svg)' }}
    >
      { step === 'connect' && <ConnectSection onSubmit={() => setStep('subscription')}/> }
      { step === 'subscription' && <SubscriptionSection packageType={packageType} onSelect={setPackageType}/> }
      { packageType !== null && <RegisterSection packageType={packageType} onSubmit={handleFormSubmit} /> }
    </Box>
  );
}