import React, { useEffect } from "react";

import { Container, Typography, CircularProgress, Box } from "@mui/material";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchHistory } from "store/slices/testingHistory.slice";

import AppTable from "./components/AppTable";

import type { Run } from 'components/CreateCertificate/CreateCertificate';

import "./index.css";

interface AppHistory {
  appName: string;
  history: Run[];
}

const TestHistory = () => {
  const dispatch = useAppDispatch();

  const { history, certificates, loading } = useAppSelector(state => state.testingHistory);

  useEffect(() => {
    dispatch(fetchHistory({}));
  }, []);

  const formatRepoUrl = (repoUrl: string) => {
    let pieces = repoUrl.split('github:')[1].split('/')
    return (pieces[0] + "/" + pieces[1]);
  }

  const getAppsHistory = () => {
    const appsHistory: AppHistory[] = [];
    for (const row of history) {
      const repoUrl = formatRepoUrl(row.repoUrl);
      const index = appsHistory.findIndex(app => app.appName === repoUrl);
      if (index >= 0) {
        appsHistory[index].history.push(row);
      } else {
        appsHistory.push({
          appName: repoUrl,
          history: [row]
        });
      }
    }
    return appsHistory;
  }
  
  return (
    <Container className="pt-4" maxWidth={false}>
      <Typography variant="h5" className="font-medium text-main mb-6">
        Testing History
      </Typography>

      {loading && (
        <Box className="pt-16 text-center">
          <CircularProgress color="secondary" size={100} />
        </Box>
      )}

      {!loading && getAppsHistory().map(app =>
        <AppTable
          key={app.appName}
          appName={app.appName}
          history={app.history}
          certificates={certificates}
        />
      )}
    </Container>
  );
}

export default TestHistory;