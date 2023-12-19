import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

import { Grid } from "@mui/material";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchAuditorReportsMetric, fetchRunTimesMetric, fetchSubscriptionsStartedMetric, fetchSubscriptionsEndedMetric } from "store/slices/metrics.slice";

import MetricWidget from "./components/MetricWidget";
import AuditorReportsChart from "./components/AuditorReportsChart";
import RunTimesChart from "./components/RunTimesChart";
import SubscriptionsChart from "./components/SubscriptionsChart";

import "./index.css";

const GRAPH_COLOR_1 = '#A4A1FB';
const GRAPH_COLOR_2 = '#57D9FE';
const GRAPH_COLOR_3 = '#5FE3A1';
const GRAPH_COLOR_4 = '#FFCA28';

const getTimeframeDates = (timeframe: string) => {
  let since = dayjs().subtract(1, 'day');
  if (timeframe === 'week') since = since.subtract(1, 'week');
  if (timeframe === 'month') since = since.subtract(1, 'month');
  if (timeframe === 'month-3') since = since.subtract(3, 'month');
  return { since, until: dayjs() };
};

const Metrics = () => {
  const dispatch = useAppDispatch();
  const [ auditorReportsTimeframe, setAuditorReportsTimeframe ] = useState<string>('day');
  const [ runTimesTimeframe, setRunTimesTimeframe ] = useState<string>('day');
  const [ subscriptionsStartedTimeframe, setSubscriptionsStartedTimeframe ] = useState<string>('day');
  const [ subscriptionsEndedTimeframe, setSubscriptionsEndedTimeframe ] = useState<string>('day');
  const { auditorReportsMetrics, runTimesMetrics, subscriptionStartedMetrics, subscriptionEndedMetrics } = useAppSelector(state => state.metrics);

  useEffect(() => {
    dispatch(fetchAuditorReportsMetric(getTimeframeDates(auditorReportsTimeframe)));
  }, [auditorReportsTimeframe]);

  useEffect(() => {
    dispatch(fetchRunTimesMetric(getTimeframeDates(runTimesTimeframe)));
  }, [runTimesTimeframe]);

  useEffect(() => {
    dispatch(fetchSubscriptionsStartedMetric(getTimeframeDates(subscriptionsStartedTimeframe)));
  }, [subscriptionsStartedTimeframe]);

  useEffect(() => {
    dispatch(fetchSubscriptionsEndedMetric(getTimeframeDates(subscriptionsEndedTimeframe)));
  }, [subscriptionsEndedTimeframe]);
  
  return (
    <Grid container spacing={2}>
      <MetricWidget
        title="Auditor reports"
        timeframe={auditorReportsTimeframe}
        setTimeframe={setAuditorReportsTimeframe}
      >
        <AuditorReportsChart
          auditColor={GRAPH_COLOR_1}
          certificateColor={GRAPH_COLOR_2}
          data={auditorReportsMetrics}
          timeframe={auditorReportsTimeframe}
        />
      </MetricWidget>

      <MetricWidget
        title="Run times"
        timeframe={runTimesTimeframe}
        setTimeframe={setRunTimesTimeframe}
      >
        <RunTimesChart
          avgColor={GRAPH_COLOR_3}
          maxColor={GRAPH_COLOR_4}
          data={runTimesMetrics}
          timeframe={runTimesTimeframe}
        />
      </MetricWidget>

      <MetricWidget
        title="Subscriptions started"
        timeframe={subscriptionsStartedTimeframe}
        setTimeframe={setSubscriptionsStartedTimeframe}
      >
        <SubscriptionsChart
          label="Subscriptions started"
          colorName="color3"
          color={GRAPH_COLOR_3}
          data={subscriptionStartedMetrics}
          timeframe={subscriptionsStartedTimeframe}
        />
      </MetricWidget>

      <MetricWidget
        title="Subscriptions ended"
        timeframe={subscriptionsEndedTimeframe}
        setTimeframe={setSubscriptionsEndedTimeframe}
      >
        <SubscriptionsChart
          label="Subscriptions ended"
          colorName="color4"
          color={GRAPH_COLOR_4}
          data={subscriptionEndedMetrics}
          timeframe={subscriptionsEndedTimeframe}
        />
      </MetricWidget>
    </Grid>
  );
};

export default Metrics;