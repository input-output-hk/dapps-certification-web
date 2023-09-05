import { createSlice } from "@reduxjs/toolkit";

interface PriceState {
  price: number;
}

const initialState: PriceState = {
  price: 0
};

export const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {
    fetchPrice: (state) => {
      state.price = 1000 + (Math.random() * 500);
    },
  },
});

export const { fetchPrice } = priceSlice.actions;

export default priceSlice.reducer;
