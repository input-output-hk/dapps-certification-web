import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Container, Paper, Box, Typography, CircularProgress, Button, Grid } from "@mui/material";
import SuccessIcon from "@mui/icons-material/Check";
import FailedIcon from "@mui/icons-material/Close";
import ProgressIcon from "@mui/icons-material/Schedule";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchHistory } from "store/slices/testingHistory.slice";

import type { Run } from 'components/CreateCertificate/CreateCertificate';

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

const ProgressWidget = (props: { title?: string, subtitle?: string, value?: number, color?: string }) => (
  <Paper elevation={0} className="rounded-none flex flex-row pt-5 pb-4 px-6 border border-solid border-slate-200">
    <Box className="flex-1 flex flex-col text-left justify-center mt-[-1em]">
      <Typography className="font-normal text-secondary text-md mb-2 capitalize">
        { props.subtitle }
      </Typography>
      <Typography className="font-bold text-main text-2xl">
        { props.title }
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

const IconWidget = (props: { title?: string, subtitle?: string, color?: string, icon?: any }) => (
  <Paper elevation={0} className="rounded-none flex flex-row pt-5 pb-4 px-6 border border-solid border-slate-200">
    <Box className="flex-1 flex flex-col text-left justify-center mt-[-1em]">
      <Typography className="font-normal text-secondary text-md mb-2 capitalize">
        { props.subtitle }
      </Typography>
      <Typography className="font-bold text-main text-2xl">
        { props.title }
      </Typography>
    </Box>
    <Box className="flex-0 relative" sx={{ color: props.color || 'transparent' }}>
      <CircularProgress color="inherit" variant="determinate" size={100} thickness={4} value={100}/>
      <Box className="absolute top-0 left-0 w-full flex items-center justify-center">
        <props.icon className="mt-[26px] text-5xl" color="inherit" />
      </Box>
    </Box>
  </Paper>
);

const ButtonWidget = (props: { title?: string, subtitle?: string, button?: string, action?: () => void }) => (
  <Paper elevation={0} className="px-4 py-10 text-center rounded-none border border-solid border-slate-200">
    <Typography className="font-bold text-main text-2xl mb-2">
      { props.title }
    </Typography>
    <Typography className="font-normal text-secondary text-md mb-8">
      { props.subtitle }
    </Typography>
    <Button
      variant="outlined" size="large"
      className="button-outlined w-[60%]"
      onClick={props.action}
    >
      { props.button }
    </Button>
  </Paper>
);

const TestingHistoryWidget = (props: { history: Run[], loading: boolean }) => {
  
  const formatRepoUrl = (repoUrl: string) => {
    let pieces = repoUrl.split('github:')[1].split('/')
    return (pieces[0] + "/" + pieces[1]);
  }

  const getColorByStatus = (runStatus: string) => {
    if (runStatus === 'queued') return '#38bdf8';
    if (runStatus === 'failed' || runStatus === 'aborted') return '#ef4444';
    return '#a3e635';
  }

  const getIconByStatus = (runStatus: string) => {
    if (runStatus === 'queued') return ProgressIcon;
    if (runStatus === 'failed' || runStatus === 'aborted') return FailedIcon;
    return SuccessIcon;
  }

  if (props.loading) {
    return (
      <Grid item xs={12}>
        <Paper elevation={0} className="p-[40px] flex items-center justify-center rounded-none border border-solid border-slate-200">
          <CircularProgress color="secondary" size={80} />
        </Paper>
      </Grid>
    );
  }

  return (
    <Grid item xs={12}>
      <Paper elevation={0} className="p-4 rounded-none border border-solid border-slate-200">
        <Typography className="text-center font-bold text-main text-2xl mb-4">
          Testing History
        </Typography>
        <Grid container spacing={2}>
          {props.history.slice(0, 3).map(run => (
            <Grid item md={12} lg={4} key={run.runId}>
              <IconWidget
                title={formatRepoUrl(run.repoUrl)}
                subtitle={run.runStatus.replace('-', ' ')}
                color={getColorByStatus(run.runStatus)}
                icon={getIconByStatus(run.runStatus)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Grid>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { history, loading } = useAppSelector(state => state.testingHistory);

  useEffect(() => { dispatch(fetchHistory({})) }, []);

  return (
    <Container maxWidth="xl" className="pt-8">
      <Typography className="text-center font-bold tracking-[.2em] text-main text-4xl mb-12">
        Plutus Testing Tool
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={4}>
          <ButtonWidget
            title="Testing"
            subtitle="Test your Dapp using Plutus Testing Tool"
            button="Test here"
            action={() => navigate('/testing')}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={4}>
          <ButtonWidget
            title="Generate a certificate metadata"
            subtitle="Generate a CIP-96 compliant certificate for your audits"
            button="Generate here"
            action={() => navigate('/audit-report-upload')}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={4}>
          <ButtonWidget
            title="Documentation"
            subtitle="Access the documentation"
            button="Read here"
            action={() => window.open('https://rsoulatiohk.github.io/docs/intro', '_blank', 'noreferrer')}
          />
        </Grid>
        <TestingHistoryWidget
          history={history}
          loading={loading}
        />
      </Grid>
    </Container>
  );
};

export default Home;