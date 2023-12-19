import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface Props {
  id: number | null;
  show: boolean;
  onClose: (id?: number | null) => void;
}

const DeleteUserModal = (props: Props) => {
  return (
    <Dialog open={props.show}>
      <DialogTitle className="inline-flex items-center text-red">
        <WarningAmberIcon color="error" className="mr-2" />
        Confirm Delete
        <CloseIcon
          onClick={() => props.onClose()}
          className="absolute right-4 cursor-pointer top-4 text-gray-600"
        />
      </DialogTitle>

      <DialogContent className="flex flex-col py-4 pb-8 items-center">
        <Typography>
          Are you sure you want to delete this User?
        </Typography>
      </DialogContent>

      <DialogActions className="inline-flex justify-between px-6 pb-6">
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => props.onClose()}
        >
          Cancel
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={() => props.onClose(props.id)}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserModal;