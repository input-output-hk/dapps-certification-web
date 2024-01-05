import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";

interface PriceState {
  price: number;
}

const initialState: PriceState = {
  price: 0
};

export const fetchPrice = createAsyncThunk("fetchPrice", async (payload: any, thunkApi) => {
  let data = null;
  do {
    try {
      const response = await fetch<number>(thunkApi, { method: 'GET', url: '/ada-usd-price' });
      data = response.data;
    } catch (e: any) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } while (data === null);
  return data;
});

export const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrice.fulfilled, (state, actions) => {
        state.price = actions.payload;
      })
  },
});

export default priceSlice.reducer;
