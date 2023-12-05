import { useEffect } from "react";

import { Container, Typography } from "@mui/material";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchHistory } from "store/slices/testingHistory.slice";

import HistoryContainer from "./components/HistoryContainer";

import "./index.css";

const TestHistory = () => {
  const dispatch = useAppDispatch();

  const { history, certificates, loading } = useAppSelector(state => state.testingHistory);

  useEffect(() => {
    dispatch(fetchHistory({}));
  }, []);

  const onRefreshData = () => {
    dispatch(fetchHistory({}));
  }
  
  return (
    <Container className="pt-4" maxWidth={false}>
      <Typography variant="h5" className="font-medium text-main mb-6">
        Testing History
      </Typography>

      <HistoryContainer history={history} certificates={certificates} loading={loading} refreshData={onRefreshData}/>
    </Container>
  );
}

export default TestHistory;