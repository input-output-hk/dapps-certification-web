import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "store/rootReducer";
import { fetch } from "../../api";

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

export const fetchActiveSubscription = createAsyncThunk('fetchActiveSubscription', async (payload, thunkApi) => {
  try {
    const {impersonate, retainId} = (thunkApi.getState() as RootState).profile;
    const response: any = await fetch<string[]>(thunkApi, { method: 'GET', url: `/profile/${impersonate ? retainId : "current"}/subscriptions/active-features` });
    if (response.status !== 200) throw new Error();
    return response.data;
    // return ['l1-run','l2-upload-report'];
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
