import dayjs from "dayjs";
import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "api/api";

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

const getUserPendingSubscriptionByTierId = async (tierId: string) => {
  const res = await fetchData.get('/profile/current/subscriptions');
  if (res.status !== 200) throw { message: res.data };
  return res.data.find((item: any) => item.tierId === tierId && item.status === 'pending');
}

const updateUserProfile = async (form: RegisterForm) => {
  const res = await fetchData.put('/profile/current', form);
  if (res.status !== 200) throw { response: res };
  return;
}

const registerSubscription = async (tierId: string) => {
  const res = await fetchData.post(`/profile/current/subscriptions/${tierId}`);
  if (res.status !== 201) throw { message: res.data };
  return res.data.id as string;
}

const getUserSubscriptionById = async (subscriptionId: string) => {
  const res = await fetchData.get('/profile/current/subscriptions');
  if (res.status !== 200) throw { message: res.data };
  if (!res.data.length) throw { message: "Unable to proceed with the current Subscription. Payment made will be refunded into your profile balance to be used for future transactions. Please retry Subscription."}
  return res.data.find((item: any) => item.id === subscriptionId);
}

const getUserBalance = async () => {
  const res = await fetchData.get('/profile/current/balance');
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

export const register = createAsyncThunk("register", async (request: RegisterRequest, { rejectWithValue, dispatch, getState }) => {
  try {

    await updateUserProfile(request.form);

    let transactionId: string|null = null;
    let subscription = await getUserPendingSubscriptionByTierId(request.tierId);

    if (!subscription) {
      const subscriptionId = await registerSubscription(request.tierId);
      subscription = await getUserSubscriptionById(subscriptionId);
      if (!subscription) throw { message: 'There\'s no subscription registered' };
      if (subscription.status !== 'pending') throw { message: 'The subscription it\'s not pending' };

      const subscriptionPrice = BigNum.from_str(subscription.price.toString());
      const balance = await getUserBalance();

      const { lessBalance, fee } = await calculateFee(subscriptionPrice, balance);
      if (!lessBalance) {
        // do nothing; auto pay from balance
      } else {
        const { wallet, walletAddress, stakeAddress } = (getState() as RootState).auth;
        transactionId = await doPayment(dispatch, wallet, walletAddress!, stakeAddress!, fee);
      }
    }

    let isActive = false;
    while (!isActive) {
      try {
        const newSubscription = await getUserSubscriptionById(subscription.id);
        if (newSubscription && newSubscription.status === 'active' && !dayjs().isAfter(dayjs(newSubscription.endDate))) {
          isActive = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        return rejectWithValue(error.message.toString());
      }
    }

    return transactionId;

  } catch (error: any) {
    return rejectWithValue(error.message.toString());
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
