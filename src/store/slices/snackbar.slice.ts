import { createSlice } from "@reduxjs/toolkit";

interface SnackbarState {
  show: boolean;
  message: string|null;
  severity: 'success' | 'info' | 'warning' | 'error';
  position: 'top' | 'bottom';
  onClose: (() => void)|null;
  action: {
    label: string;
    callback: () => void;
  } | null;
}

const initialState: SnackbarState = {
  show: false,
  message: null,
  severity: 'info',
  position: 'top',
  onClose: null,
  action: null,
};

export const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    showSnackbar: (state, actions) => ({
      show: true,
      message: actions.payload.message || null,
      severity: actions.payload.severity || 'info',
      position: actions.payload.position || 'top',
      onClose: actions.payload.onClose || null,
      action: actions.payload.action || null,
    }),
    clearSnackbar: () => initialState,
  }
});

export const { showSnackbar, clearSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;