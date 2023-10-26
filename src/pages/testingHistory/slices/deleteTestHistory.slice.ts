import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";

const initialState = {
  loading: false,
};

export const deleteTestHistoryData = createAsyncThunk("deleteTestHistoryData", async (payload: { url: string }, thunkApi) => {
  try {
    const response = await fetch(thunkApi, { method: 'DELETE', url: payload.url });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

const deleteTestHistoryDataSlice = createSlice({
  name: "deleteTestHistoryData",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteTestHistoryData.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteTestHistoryData.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTestHistoryData.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export default deleteTestHistoryDataSlice.reducer;