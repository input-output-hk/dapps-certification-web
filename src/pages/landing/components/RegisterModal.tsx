import React from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress, Button } from "@mui/material";

import "../index.css";

interface Props {
  show: boolean;
  onClose: () => void;
  success: boolean;
  transactionId: string|null;
}

const RegisterModal = (props: Props) => {
  return (
    <Dialog open={props.show} onClose={props.onClose}>
      <DialogTitle>
        {props.success ? 'Successfully initiated subscription' : 'Setting up your subscription...'}
      </DialogTitle>
      <DialogContent className="flex flex-col pt-4 pb-8 items-center">
        {props.success ? (props.transactionId &&
          <Typography>
            View your performed payment transaction&nbsp;
            <a target="_blank" rel="noreferrer" href={`https://preprod.cardanoscan.io/transaction/${props.transactionId}`}>
              here
            </a>
          </Typography>
        ) : (
          <CircularProgress color="secondary" size={50} />
        )}
      </DialogContent>
      {props.success && (
        <DialogActions>
          <Button variant="contained" className="normal-case bg-main" onClick={props.onClose}>
            Continue
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

export default RegisterModal;