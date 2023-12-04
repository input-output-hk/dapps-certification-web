import React from "react";

import { Grid, Paper } from "@mui/material";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

import "./index.css";

const DATA = [
  {name: 'A', value: 400},
  {name: 'B', value: 200},
  {name: 'C', value: 100},
  {name: 'D', value: 300},
  {name: 'E', value: 0},
  {name: 'F', value: 200},
];

const Metrics = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={12} md={12} lg={6}>
        <Paper elevation={0} className="px-0 py-6 rounded-none border border-solid border-slate-200">

        <AreaChart height={300} width={810} data={DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />

          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
        </AreaChart>

        </Paper>
      </Grid>
    </Grid>
  );
};

export default Metrics;