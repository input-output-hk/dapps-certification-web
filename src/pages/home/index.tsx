import React from "react";
import { useNavigate } from "react-router-dom";

import { Container, Paper, Box, Typography, CircularProgress, Button } from "@mui/material";
import SuccessIcon from "@mui/icons-material/Check";
import FailedIcon from "@mui/icons-material/Close";
import ProgressIcon from '@mui/icons-material/Schedule';

import "./index.css";

const ProgressIndicator = (props: { status: string, value: number }) => {
  const Icon = props.status === 'success' ? SuccessIcon : (props.status === 'failed' ? FailedIcon : ProgressIcon);
  const color = props.status === 'success' ? '#a3e635' : (props.status === 'failed' ? '#ef4444' : '#38bdf8');
  return (
    <Box className="relative mb-5" sx={{ color }}>
      <CircularProgress className="absolute opacity-40" color="inherit" variant="determinate" size={100} thickness={4} value={100}/>
      <CircularProgress color="inherit" variant="determinate" size={100} thickness={4} value={props.value}/>
      <Box className="absolute top-0 left-0 w-full flex items-center justify-center">
        <Icon className="mt-[26px] text-5xl" color="inherit" />
      </Box>
    </Box>
  );
}

const Widget = (props: { title?: string, subtitle?: string, value?: number, color?: string }) => (
  <Paper elevation={0} className="rounded-none flex flex-row pt-5 pb-4 px-6 mt-4 border border-solid border-slate-200">
    <Box className="flex-1 flex flex-col text-left justify-center mt-[-1em]">
      <Typography className="font-normal text-secondary text-md mb-2">
        { props.title }
      </Typography>
      <Typography className="font-bold text-main text-3xl">
        { props.subtitle }
      </Typography>
    </Box>
    <Box className="flex-0 relative" sx={{ color: props.color || 'transparent' }}>
      <CircularProgress className="absolute top-0 left-0 opacity-40" color="inherit" variant="determinate" size={100} thickness={4} value={100}/>
      <CircularProgress color="inherit" variant="determinate" size={100} thickness={4} value={props.value}/>
      <Box className="absolute top-0 left-0 w-full flex items-center justify-center">
        <Typography className="mt-[36px] font-bold text-main text-xl">
          { props.value !== undefined ? `${props.value}%` : '' }
        </Typography>
      </Box>
    </Box>
  </Paper>
);

const Home = () => {

  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" className="pt-8">
      <Typography className="text-center font-bold tracking-[.2em] text-main text-4xl mb-12">
        Plutus Testing Tool
      </Typography>
      <div id="homeContentWrapper" className="flex justify-evenly gap-[10px]">

        <Paper elevation={0} className="text-center rounded-none shadow p-4 flex justify-between items-center" style={{flexFlow: "column"}}>
          <h2>Testing</h2>
          <p>Test your Dapp using Plutus Testing Tool</p>
          <Button variant="outlined" size="large" className="button-outlined w-[200px]"
            onClick={() => {navigate('/testing')}}>Test here</Button>
        </Paper>

        <Paper elevation={0} className="text-center rounded-none shadow p-4 flex justify-between items-center" style={{flexFlow: "column"}}>
            <h2>Generate a certificate metadata</h2>
            <p>Generate a CIP-96 compliant certificate for your audits</p>
            <Button variant="outlined" size="large" className="button-outlined w-[200px]"
            onClick={() => {navigate('/audit-report-upload')}}>Generate here</Button>
          </Paper>

          <Paper elevation={0} className="text-center rounded-none shadow p-4 flex justify-between items-center" style={{flexFlow: "column"}}>
            <h2>Documentation</h2>
            <p>Access the documentation</p>
            <Button  variant="outlined" size="large" className="button-outlined w-[200px]"
            onClick={() => {window.open('https://rsoulatiohk.github.io/docs/intro', '_blank', 'noreferrer')}}>Read here</Button>
          </Paper>
      </div>

    </Container>
  );
};

export default Home;