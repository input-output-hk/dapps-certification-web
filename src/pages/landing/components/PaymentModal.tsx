import React from "react";

import { Dialog, DialogContent, Typography } from "@mui/material";

import "../index.css";

interface Props {
  show: boolean;
  onClose: () => void;
  transactionId: string;
}

export default (props: Props) => {
  return (
    <Dialog open={props.show} onClose={props.onClose}>
      <DialogContent className="flex flex-col items-center px-4 pt-4 pb-8 gap-4">
        <Typography>Successfully initiated subscription</Typography>
        <Typography>
          View your performed payment transaction&nbsp;
          <a target="_blank" rel="noreferrer" href={`https://preprod.cardanoscan.io/transaction/${props.transactionId}`}>
            here
          </a>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}