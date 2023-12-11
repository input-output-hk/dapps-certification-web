import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";

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

export const fetchActiveSubscription = createAsyncThunk('fetchActiveSubscription', async (payload: {}, thunkApi) => {
  try {
    const response = await fetch<string[]>(thunkApi, { method: 'GET', url: '/profile/current/subscriptions/active-features' });
    return response.data;
  } catch (error) {
    await thunkApi.dispatch(logout());
    return [];
  }
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => ({
      ...initialState,
      isSessionFetched: true
    }),
  },
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
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
