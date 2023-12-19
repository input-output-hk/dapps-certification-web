import React, { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "store/store";
import { clearSnackbar } from "store/slices/snackbar.slice";

import { Snackbar as MUISnackbar, Button, Alert } from "@mui/material";

import "./index.css";

const Snackbar = () => {
  const dispatch = useAppDispatch();
  const [hide, setHide] = useState<boolean>(true);
  const { show, message, severity, position, onClose, action } = useAppSelector(state => state.snackbar);

  useEffect(() => {
    if (show === true) {
      setHide(false);
    }
  }, [show]);

  const handleClose = () => {
    setHide(true);
    if (onClose !== null) onClose();
    setTimeout(() => dispatch(clearSnackbar()), 1000);
  }

  return (
    <MUISnackbar
      open={show && !hide}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: position, horizontal: 'center' }}
    >
      <Alert
        variant="filled"
        severity={severity}
        onClose={handleClose}
        action={action !== null && (
          <Button
            className="normal-case"
            color="inherit"
            size="small"
            variant="outlined"
            onClick={action.callback}
          >
            {action.label}
          </Button>
        )}
      >
        {message}
      </Alert>
    </MUISnackbar>
  );
}

export default Snackbar;