import React from "react";

import { Grid, Paper, Box, Typography, FormControl, Select, MenuItem } from "@mui/material";

import "../index.css";

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

export default MetricWidget;