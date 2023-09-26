import React from "react";

import { Container, Grid, Paper, Box, Typography, CircularProgress } from "@mui/material";
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
  return (
    <Container maxWidth="xl" className="pt-8">
      <Typography className="text-center font-bold tracking-[.2em] text-main text-4xl mb-16">
        Plutus Testing Tool
      </Typography>
      <Grid container spacing={4}>

        <Grid item xs={4}>
          <Paper elevation={0} className="text-center rounded-none shadow p-4">
            <Typography className="font-medium text-main text-xl text-ellipsis overflow-hidden whitespace-nowrap mb-5">
              Ali-Hill/minimal-ptt-examples: 57538a3e1ddba14366b0e718107cef5ce9aabb61
            </Typography>
            <ProgressIndicator status="working" value={25} />
            <Widget title="Running" subtitle="--/--" />
            <Widget />
          </Paper>
        </Grid>

        <Grid item xs={4}>
          <Paper elevation={0} className="text-center rounded-none shadow p-4">
            <Typography className="font-medium text-main text-xl text-ellipsis overflow-hidden whitespace-nowrap mb-5">
              Ali-Hill/minimal-ptt-examples: 57538a3e1ddba14366b0e718107cef5ce9aabb61
            </Typography>
            <ProgressIndicator status="success" value={100} />
            <Widget
              title="Code coverage"
              subtitle="238/251"
              color="#a78bfa"
              value={45}
            />
            <Widget
              title="Property Based Testing"
              subtitle="500/1000"
              color="#fbbf24"
              value={75}
            />
          </Paper>
        </Grid>

        <Grid item xs={4}>
          <Paper elevation={0} className="text-center rounded-none shadow p-4">
            <Typography className="font-medium text-main text-xl text-ellipsis overflow-hidden whitespace-nowrap mb-5">
              Ali-Hill/minimal-ptt-examples: 57538a3e1ddba14366b0e718107cef5ce9aabb61
            </Typography>
            <ProgressIndicator status="failed" value={100} />
            <Widget title="Build failed" subtitle="--/--" />
            <Widget />
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};

export default Home;