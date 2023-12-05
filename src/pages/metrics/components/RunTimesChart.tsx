import React from "react";
import dayjs from "dayjs";

import { Box } from "@mui/material";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

import type { RunTimeMetric } from "store/slices/metrics.slice";

import { getTickDateFormat } from '../utils';

import "../index.css";

const getRunTimeTickFormat = (value: number) => {
  if (value < 60) return `${value}s`;
  if (value < 3600) return `${Math.round(value/60)}m`;
  return `${Math.round(value/3600)}h`; 
}

interface RunTimesChartProps {
  maxColor: string;
  avgColor: string;
  timeframe: string;
  data: RunTimeMetric[];
}

const RunTimesChart = (props: RunTimesChartProps) => (
  <Box className="pl-0 pr-4 pt-0 pb-1">
    <ResponsiveContainer width="100%" aspect={4.0/1.5}>
      <AreaChart data={props.data}>
        <defs>
          <linearGradient id="avgColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={props.avgColor} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={props.avgColor} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="maxColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={props.maxColor} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={props.maxColor} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="maxTime"
          stroke={props.maxColor}
          fillOpacity={1}
          fill="url(#maxColor)"
        />
        <Area
          type="monotone"
          dataKey="avgTime"
          stroke={props.avgColor}
          fillOpacity={1}
          fill="url(#avgColor)"
        />
        <XAxis
          dataKey="date"
          type="number"
          scale="linear"
          domain={['dataMin','dataMax']}
          tickFormatter={value => getTickDateFormat(props.timeframe, value)}
        />
        <YAxis
          tickFormatter={getRunTimeTickFormat}
        />
        <Tooltip
          labelFormatter={value => dayjs.unix(value).format('DD/MM/YYYY HH:mm:ss')}
          formatter={(value, name) => {
            if (name === 'avgTime') return [getRunTimeTickFormat(value as number), 'Average run time'];
            if (name === 'maxTime') return [getRunTimeTickFormat(value as number), 'Max run time'];
            return [value, name];
          }}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
      </AreaChart>
    </ResponsiveContainer>
  </Box>
);

export default RunTimesChart;