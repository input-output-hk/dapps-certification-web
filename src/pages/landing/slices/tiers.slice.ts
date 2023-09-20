import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "api/api";

interface TierFeature {
  name: string;
}

export interface Tier {
  id: string;
  name: string;
  subtitle: string;
  features: TierFeature[];
  usdPrice: number;
  enabled: boolean;
}

interface TiersState {
  tiers: Tier[];
}

const initialState: TiersState = {
  tiers: []
};

export const fetchTiers = createAsyncThunk("fetchTiers", async (payload: any, { rejectWithValue }) => {
  try {
    const response = await fetchData.get('/tiers');
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.response.data);
  }
});

export const tiersSlide = createSlice({
  name: "tiers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTiers.pending, (state) => {
        state.tiers = [];
      })
      .addCase(fetchTiers.fulfilled, (state, actions) => {
        state.tiers = actions.payload;
      })
      .addCase(fetchTiers.rejected, (state, actions) => {
        state.tiers = [];
      })
  },
});

export default tiersSlide.reducer;
