import React from "react";
import dayjs from "dayjs";

import { Box } from "@mui/material";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

import type { SubscriptionMetric } from "store/slices/metrics.slice";

import { getTickDateFormat } from '../utils';

import "../index.css";

interface SubscriptionsChartProps {
  label: string;
  color: string;
  colorName: string;
  timeframe: string;
  data: SubscriptionMetric[];
}

const SubscriptionsChart = (props: SubscriptionsChartProps) => (
  <Box className="pl-0 pr-4 pt-0 pb-1">
    <ResponsiveContainer width="100%" aspect={4.0/1.5} debounce={1}>
      <AreaChart data={props.data}>
        <defs>
          <linearGradient id={props.colorName} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={props.color} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={props.color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="count"
          stroke={props.color}
          fillOpacity={1}
          fill={`url(#${props.colorName})`}
        />
        <XAxis
          dataKey="date"
          type="number"
          scale="linear"
          domain={['dataMin','dataMax']}
          tickFormatter={value => getTickDateFormat(props.timeframe, value)}
        />
        <YAxis
          type="number"
          domain={[0,'dataMax']}
        />
        <Tooltip
          labelFormatter={value => dayjs.unix(value).format('DD/MM/YYYY HH:mm:ss')}
          formatter={value => [value, props.label]}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
      </AreaChart>
    </ResponsiveContainer>
  </Box>
);

export default SubscriptionsChart;