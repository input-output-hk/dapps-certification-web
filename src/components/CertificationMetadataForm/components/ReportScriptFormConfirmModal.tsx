import React from "react";

import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";

import "../index.css";

interface Props {
  show: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ReportScriptFormConfirmModal = (props: Props) => {
  return (
    <Dialog open={props.show} onClose={props.onClose}>
      <DialogTitle>
        Do you want to delete the current script?
      </DialogTitle>
      <DialogActions>
        <Button variant="contained" className="button-contained-main" onClick={props.onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="error" className="normal-case" onClick={props.onConfirm}>
          Delete script
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReportScriptFormConfirmModal;