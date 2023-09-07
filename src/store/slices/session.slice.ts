import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "api/api";

interface SessionState {
  features: string[];
  hasAnActiveSubscription: boolean;
  sessionFetched: boolean;
}

const initialState: SessionState = {
  features: [],
  hasAnActiveSubscription: false,
  sessionFetched: false,
};

export const fetchUserSubscription = createAsyncThunk("fetchUserSubscription", async (payload: any, { rejectWithValue }) => {
  try {
    const response = await fetchData.get('/profile/current/subscriptions/active-features');
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.response.data);
  }
});

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSubscription.pending, (state) => {
        state.features = [];
        state.hasAnActiveSubscription = false;
        state.sessionFetched = false;
      })
      .addCase(fetchUserSubscription.fulfilled, (state, actions) => {
        state.features = actions.payload;
        state.hasAnActiveSubscription = state.features.includes('l2-upload-report') && state.features.includes('l1-run');
        state.sessionFetched = true;
      })
      .addCase(fetchUserSubscription.rejected, (state, actions) => {
        state.features = [];
        state.hasAnActiveSubscription = false;
        state.sessionFetched = true;
      })
  },
});

export default sessionSlice.reducer;
