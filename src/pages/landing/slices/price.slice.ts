import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "api/api";

interface PriceState {
  price: number;
}

const initialState: PriceState = {
  price: 0
};

export const fetchPrice = createAsyncThunk("fetchPrice", async (payload: any, { rejectWithValue }) => {
  try {
    const response = await fetchData.get('/ada-usd-price');
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.response.data);
  }
});

export const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrice.pending, (state) => {
        state.price = 0;
      })
      .addCase(fetchPrice.fulfilled, (state, actions) => {
        state.price = actions.payload;
      })
      .addCase(fetchPrice.rejected, (state, actions) => {
        state.price = 0;
      })
  },
});

export default priceSlice.reducer;
