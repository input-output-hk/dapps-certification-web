import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

import { Grid, Paper, Box, Typography, FormControl, Select, MenuItem } from "@mui/material";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchAuditorReportsMetric, fetchRunTimesMetric } from "store/slices/metrics.slice";

import type { AuditorReportMetric, RunTimeMetric } from "store/slices/metrics.slice";

import "./index.css";

const GRAPH_COLOR_1 = '#A4A1FB';
const GRAPH_COLOR_2 = '#57D9FE';
const GRAPH_COLOR_3 = '#5FE3A1';

const getTimeframeDates = (timeframe: string) => {
  let from = dayjs().startOf('day');
  if (timeframe === 'week') from = from.subtract(1, 'week');
  if (timeframe === 'month') from = from.subtract(1, 'month');
  if (timeframe === 'month-3') from = from.subtract(3, 'month');
  return {
    from: from.toISOString(),
    to: dayjs().endOf('day').toISOString(),
  }
};

const getTickFormat = (timeframe: string, value: number) => {
  if (timeframe === 'day') return dayjs.unix(value).format('HH:mm');
  if (timeframe === 'week') return dayjs.unix(value).format('DD/MM HH:mm');
  return dayjs.unix(value).format('DD/MM');
}

interface MetricWidgetProps {
  title: string;
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
}

const MetricWidget = (props: React.PropsWithChildren<MetricWidgetProps>) => (
  <Grid item xs={12} sm={12} md={12} lg={6}>
    <Paper elevation={0} className="rounded-none border border-solid border-slate-200">
      <Box className="p-4 pr-5 flex flex-row">
        <Typography className="pl-2 pt-[4px] font-normal text-main text-[18px] flex-1">
          {props.title}
        </Typography>
        <FormControl className="flex-0" size="small">
          <Select
            value={props.timeframe}
            onChange={event => props.setTimeframe(event.target.value)}
          >
            <MenuItem value="day">Last day</MenuItem>
            <MenuItem value="week">Last week</MenuItem>
            <MenuItem value="month">Last month</MenuItem>
            <MenuItem value="month-3">Last 3 months</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {props.children}
    </Paper>
  </Grid>
);

interface AuditorReportsChartProps {
  timeframe: string;
  data: AuditorReportMetric[];
}

const AuditorReportsChart = (props: AuditorReportsChartProps) => (
  <Box className="pl-0 pr-4 pt-0 pb-1">
    <ResponsiveContainer width="100%" aspect={4.0/1.5}>
      <AreaChart data={props.data}>
        <defs>
          <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={GRAPH_COLOR_1} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={GRAPH_COLOR_1} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="color2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={GRAPH_COLOR_2} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={GRAPH_COLOR_2} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="auditLevel"
          stroke={GRAPH_COLOR_1}
          fillOpacity={1}
          fill="url(#color1)"
        />
        <Area
          type="monotone"
          dataKey="certificateLevel"
          stroke={GRAPH_COLOR_2}
          fillOpacity={1}
          fill="url(#color2)"
        />
        <XAxis
          dataKey="date"
          scale="linear"
          tickCount={10}
          tickFormatter={value => getTickFormat(props.timeframe, value)}
        />
        <YAxis />
        <Tooltip />
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
      </AreaChart>
    </ResponsiveContainer>
  </Box>
);

const Metrics = () => {
  const dispatch = useAppDispatch();
  const [ auditorReportsTimeframe, setAuditorReportsTimeframe ] = useState<string>('day');
  const [ runTimesTimeframe, setRunTimesTimeframe ] = useState<string>('day');
  const { auditorReportsMetrics, runTimesMetrics } = useAppSelector(state => state.metrics);

  useEffect(() => {
    dispatch(fetchAuditorReportsMetric(getTimeframeDates(auditorReportsTimeframe)));
  }, [auditorReportsTimeframe]);

  useEffect(() => {
    dispatch(fetchRunTimesMetric(getTimeframeDates(runTimesTimeframe)));
  }, [runTimesTimeframe]);
  
  return (
    <Grid container spacing={2}>
      <MetricWidget
        title="Auditor reports"
        timeframe={auditorReportsTimeframe}
        setTimeframe={setAuditorReportsTimeframe}
      >
        <AuditorReportsChart
          data={auditorReportsMetrics}
          timeframe={auditorReportsTimeframe}
        />
      </MetricWidget>

      <MetricWidget
        title="Run times"
        timeframe={runTimesTimeframe}
        setTimeframe={setRunTimesTimeframe}
      >
        
      </MetricWidget>
    </Grid>
  );
};

export default Metrics;