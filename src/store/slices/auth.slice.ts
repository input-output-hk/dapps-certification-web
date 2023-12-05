import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";
import { clearSession } from "./session.slice";
import { clearProfile } from "./profile.slice";
import { clearWallet } from "./walletConnection.slice";

interface AuthState {
  isSessionFetched: boolean;
  hasAnActiveSubscription: boolean;
  features: string[];
}

const initialState: AuthState = {
  isSessionFetched: false,
  hasAnActiveSubscription: false,
  features: [],
};

export const fetchActiveSubscription = createAsyncThunk('fetchActiveSubscription', async (payload: any, thunkApi) => {
  try {
    const response: any = await fetch<string[]>(thunkApi, { method: 'GET', url: `/profile/${payload || "current"}/subscriptions/active-features` });
    if (response.status !== 200) throw new Error();
    return response.data;
  } catch (error) {
    return [];
  }
});

export const logout = createAsyncThunk('logout', async (payload: {}, { dispatch }) => {
  dispatch(clearProfile());
  dispatch(clearWallet());
  dispatch(clearSession());
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveSubscription.pending, (state) => {
        state.isSessionFetched = false;
        state.hasAnActiveSubscription = false;
        state.features = [];
      })
      .addCase(fetchActiveSubscription.fulfilled, (state, actions) => {
        state.isSessionFetched = true;
        state.hasAnActiveSubscription = actions.payload.includes('l2-upload-report') && actions.payload.includes('l1-run');
        state.features = actions.payload;
      })
      .addCase(fetchActiveSubscription.rejected, (state) => {
        state.isSessionFetched = true;
        state.hasAnActiveSubscription = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isSessionFetched = true;
        state.hasAnActiveSubscription = false;
        state.features = [];
      })
  },
});

export default authSlice.reducer;
