import React from "react";
import dayjs from "dayjs";

import { Box } from "@mui/material";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

import type { AuditorReportMetric } from "store/slices/metrics.slice";

import { getTickDateFormat } from '../utils';

import "../index.css";

interface AuditorReportsChartProps {
  auditColor: string;
  certificateColor: string;
  timeframe: string;
  data: AuditorReportMetric[];
}

const AuditorReportsChart = (props: AuditorReportsChartProps) => (
  <Box className="pl-0 pr-4 pt-0 pb-1">
    <ResponsiveContainer width="100%" aspect={4.0/1.5} debounce={1}>
      <AreaChart data={props.data}>
        <defs>
          <linearGradient id="auditColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={props.auditColor} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={props.auditColor} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="certificateColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={props.certificateColor} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={props.certificateColor} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="auditLevelCount"
          stroke={props.auditColor}
          fillOpacity={1}
          fill="url(#auditColor)"
        />
        <Area
          type="monotone"
          dataKey="certificateLevelCount"
          stroke={props.certificateColor}
          fillOpacity={1}
          fill="url(#certificateColor)"
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
          formatter={(value, name) => {
            if (name === 'auditLevelCount') return [value, 'Audit level reports'];
            if (name === 'certificateLevelCount') return [value, 'Certificate level reports'];
            return [value, name];
          }}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
      </AreaChart>
    </ResponsiveContainer>
  </Box>
);

export default AuditorReportsChart;