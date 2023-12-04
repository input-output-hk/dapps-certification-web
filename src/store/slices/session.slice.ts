import { createSlice } from "@reduxjs/toolkit";

interface SessionState {
  authToken: string | null;
  accessToken: string | null;
  networkId: number | null;
  walletAddress: string | null;
  role: string | null;
}

const initialState: SessionState = {
  authToken: null,
  accessToken: null,
  networkId: null,
  walletAddress: null,
  role: null,
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    clearSession: () => initialState,
    setSession: (state, actions) => ({
      ...state,
      authToken: actions.payload.authToken,
      networkId: actions.payload.networkId,
      walletAddress: actions.payload.walletAddress,
    }),
    setAccessToken: (state, actions) => ({
      ...state,
      accessToken: actions.payload.accessToken,
    }),
    setRole: (state, actions) => ({
      ...state,
      role: actions.payload.role,
    }),
    clearAccessToken: (state, actions) => ({
      ...state,
      accessToken: null,
    })
  }
});

export const { clearSession, setSession, setAccessToken, setRole, clearAccessToken } = sessionSlice.actions;

export default sessionSlice.reducer;