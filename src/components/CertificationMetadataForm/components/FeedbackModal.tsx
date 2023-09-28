import React from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress, Button } from "@mui/material";

import "../index.css";

interface Props {
  show: boolean;
  loading: boolean;
  success: boolean;
  errorMessage: string|null;
  onClose: () => void;
}

const FeedbackModal = (props: Props) => {
  return (
    <Dialog open={props.show} onClose={props.onClose}>
      <DialogTitle>
        {props.loading ? 'Submitting Auditor Report...' : null}
        {props.success ? 'Successfully submitted Auditor Report' : null}
        {props.errorMessage !== null ? 'Error submitting Auditor Report' : null}
      </DialogTitle>
      <DialogContent className="flex flex-col items-center">
        {!props.loading ? (
          <Typography>
            {props.success ? 'Both off-chain and on-chain certificates will be downloaded at once now.' : null}
            {props.errorMessage}
          </Typography>
        ) : (
          <CircularProgress color="secondary" size={50} />
        )}
      </DialogContent>
      {!props.loading && (
        <DialogActions>
          <Button variant="contained" className="button-contained-main" onClick={props.onClose}>
            Close
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

export default FeedbackModal;