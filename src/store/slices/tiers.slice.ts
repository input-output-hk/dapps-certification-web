import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import {fetch} from "api";
import * as Cert from 'dapps-certification'

export type Tier = Cert.TierDTO

interface TiersState {
  tiers: Tier[];
}

const initialState: TiersState = {
  tiers: []
};

export const fetchTiers = createAsyncThunk("fetchTiers", async (_: any, thunkApi) => {
  try {
    const response = await fetch<Cert.TierDTO[]>(thunkApi, {method: 'GET', url: '/tiers'});
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
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
      .addCase(fetchTiers.rejected, (state) => {
        state.tiers = [];
      })
  },
});

export default tiersSlide.reducer;
