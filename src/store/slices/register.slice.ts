import dayjs from "dayjs";
import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "api/api";

import { payFromWallet } from "store/slices/walletTransaction.slice";

import type { RootState } from "../rootReducer";

export interface RegisterForm {
  companyName: string;
  contactEmail: string;
  email: string;
  fullName: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface RegisterRequest {
  form: RegisterForm;
  tierId: string;
}

interface RegisterState {
  processing: boolean;
  success: boolean;
  errorMessage: string | null;
  transactionId: string | null;
}

const initialState: RegisterState = {
  processing: false,
  success: false,
  errorMessage: null,
  transactionId: null,
};

export const register = createAsyncThunk("register", async (request: RegisterRequest, { rejectWithValue, dispatch, getState }) => {
  try {

    const putProfileRes = await fetchData.put('/profile/current', request.form);
    if (putProfileRes.status !== 200) throw { response: putProfileRes };

    const registerSubscriptionRes = await fetchData.post(`/profile/current/subscriptions/${request.tierId}`);
    if (registerSubscriptionRes.status !== 201) throw { message: registerSubscriptionRes.data };
    const subscriptionId = registerSubscriptionRes.data.id as string;

    const subscriptionsRes = await fetchData.get('/profile/current/subscriptions');
    if (subscriptionsRes.status !== 200) throw { message: subscriptionsRes.data };
    const subscription = subscriptionsRes.data.find((item: any) => item.id === subscriptionId);

    if (!subscription) throw { message: 'There\'s no subscription registered' };
    if (subscription.status !== 'pending') throw { message: 'The subscription it\'s not pending' };

    const subscriptionPrice = BigNum.from_str(subscription.price.toString());
    const balanceRes = await fetchData.get('/profile/current/balance');
    if (balanceRes.status !== 200) throw { message: balanceRes.data };
    const balance = BigNum.from_str(balanceRes.data.toString());

    let lessBalance = false;
    if (balance.less_than(subscriptionPrice)) {
      lessBalance = true;
    } else {
      const difference = balance.checked_sub(subscriptionPrice);
      lessBalance = difference.less_than(BigNum.from_str('0'));
    }

    if (!lessBalance) throw { message: 'Not enough balance' }; 

    const oneAdaInLovelaces = 1000000;
    let fee = BigNum.from_str(oneAdaInLovelaces.toString()); // 1 ADA in lovelaces - min req for cardano wallet txn
    if (fee.less_than(subscriptionPrice)) fee = subscriptionPrice;

    const { wallet, walletAddress: address } = (getState() as RootState).auth;
    const paymentRes = await dispatch(payFromWallet({ wallet, address, fee }));
    if (paymentRes?.error?.message) throw paymentRes?.error;
    const transactionId = paymentRes.payload;

    let isActive = false;
    while (!isActive) {
      try {
        const res = await fetchData.get('/profile/current/subscriptions');
        const subscription = res.data.find((item: any) => item.id === subscriptionId);
        if (subscription && subscription.status === 'active' && !dayjs().isAfter(dayjs(subscription.endDate))) {
          isActive = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {}
    }

    return transactionId;

  } catch (error: any) {
    return rejectWithValue(error.message.toString());
  }
});

export const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.processing = true;
        state.success = false;
        state.errorMessage = null;
        state.transactionId = null;
      })
      .addCase(register.fulfilled, (state, actions) => {
        state.processing = false;
        state.success = true;
        state.transactionId = actions.payload;
      })
      .addCase(register.rejected, (state, actions) => {
        state.processing = false;
        state.errorMessage = actions.payload as string;
      })
  },
});

export default registerSlice.reducer;
