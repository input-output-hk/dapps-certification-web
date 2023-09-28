import React, { ReactNode } from "react";

import { Box, Paper } from "@mui/material";

import "../index.css";

const Container = (props: {children: ReactNode, standalone?: boolean}) => {
  return props.standalone ? (
    <Paper elevation={0} className="shadow rounded-none px-4 pb-4">
      {props.children}
    </Paper>
  ) : (
    <Box className="px-4 pb-4">
      {props.children}
    </Box>
  );
}

export default Container;