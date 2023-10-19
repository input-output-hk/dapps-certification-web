import dayjs from "dayjs";
import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";

import { payFromWallet } from "store/slices/walletTransaction.slice";

import type { RootState } from "../rootReducer";

export interface RegisterForm {
  address: string;
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

const getUserPendingSubscriptionByTierId = async (thunkApi: any, tierId: string) => {
  const res = await fetch<{ tierId: string, status: string }[]>(thunkApi, { method: 'GET', url: '/profile/current/subscriptions' });
  if (res.status !== 200) throw { message: res.data };
  return res.data.find(item => item.tierId === tierId && item.status === 'pending');
}

const updateUserProfile = async (thunkApi: any, data: RegisterForm) => {
  const res = await fetch(thunkApi, { method: 'PUT', url: '/profile/current', data });
  if (res.status !== 200) throw { message: res.data };
  return;
}

const registerSubscription = async (thunkApi: any, tierId: string) => {
  const res = await fetch<{ id: string }>(thunkApi, { method: 'POST', url: `/profile/current/subscriptions/${tierId}` });
  if (res.status !== 201) throw { message: res.data };
  return res.data.id;
}

const getUserSubscriptionById = async (thunkApi: any, subscriptionId: string) => {
  const res = await fetch<{ id: string, status: String, endDate: string }[]>(thunkApi, { method: 'GET', url: '/profile/current/subscriptions' });
  if (res.status !== 200) throw { message: res.data };
  if (!res.data.length) throw { message: "Unable to proceed with the current Subscription. Payment made will be refunded into your profile balance to be used for future transactions. Please retry Subscription."}
  return res.data.find(item => item.id === subscriptionId);
}

const getUserBalance = async (thunkApi: any) => {
  const res = await fetch<number>(thunkApi, { method: 'GET', url: '/profile/current/balance' });
  if (res.status !== 200) throw { message: res.data };
  return BigNum.from_str(res.data.toString());
}

const calculateFee = async (subscriptionPrice: BigNum, balance: BigNum) => {
  let lessBalance = false;
  if (balance.less_than(subscriptionPrice)) {
    lessBalance = true;
  } else {
    const difference = balance.checked_sub(subscriptionPrice);
    lessBalance = difference.less_than(BigNum.from_str('0'));
  }

  const oneAdaInLovelaces = 1000000;
  let fee = BigNum.from_str(oneAdaInLovelaces.toString()); // 1 ADA in lovelaces - min req for cardano wallet txn
  if (fee.less_than(subscriptionPrice)) fee = subscriptionPrice;

  return { lessBalance, fee };
}

const doPayment = async (dispatch: any, wallet: any, walletAddress: string, stakeAddress: string, fee: BigNum) => {
  const res = await dispatch(payFromWallet({ wallet, address: walletAddress, payer: stakeAddress, fee }));
  if (res?.error?.message) throw res?.error;
  return res.payload;
}

export const register = createAsyncThunk("register", async (request: RegisterRequest, thunkApi) => {
  try {

    await updateUserProfile(thunkApi, request.form);

    let transactionId: string|null = null;
    let subscription: any = await getUserPendingSubscriptionByTierId(thunkApi, request.tierId);

    if (!subscription) {
      const subscriptionId = await registerSubscription(thunkApi, request.tierId);
      subscription = await getUserSubscriptionById(thunkApi, subscriptionId);
      if (!subscription) throw { message: 'There\'s no subscription registered' };
      if (subscription.status !== 'pending') throw { message: 'The subscription it\'s not pending' };

      const subscriptionPrice = BigNum.from_str(subscription.price.toString());
      const balance = await getUserBalance(thunkApi);

      const { lessBalance, fee } = await calculateFee(subscriptionPrice, balance);
      if (!lessBalance) {
        // do nothing; auto pay from balance
      } else {
        const { wallet, walletAddress, stakeAddress } = (thunkApi.getState() as RootState).walletConnection;
        transactionId = await doPayment(thunkApi.dispatch, wallet, walletAddress!, stakeAddress!, fee);
      }
    }

    let isActive = false;
    while (!isActive) {
      try {
        const newSubscription = await getUserSubscriptionById(thunkApi, subscription.id);
        if (newSubscription && newSubscription.status === 'active' && !dayjs().isAfter(dayjs(newSubscription.endDate))) {
          isActive = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        return thunkApi.rejectWithValue(error.message.toString());
      }
    }

    return transactionId;

  } catch (error: any) {
    return thunkApi.rejectWithValue(error.message.toString());
  }
});

export const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    clear: () => initialState
  },
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

export const { clear } = registerSlice.actions;

export default registerSlice.reducer;
