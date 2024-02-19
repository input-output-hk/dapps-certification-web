import dayjs from "dayjs";
import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "../../api";

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
  loading: boolean;
  processing: boolean;
  success: boolean;
  errorMessage: string | null;
  transactionId: string | null;
}

const initialState: RegisterState = {
  processing: false,
  loading: false,
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

const isSubscriptionActive = (currentSub: any) => {
  return currentSub && currentSub.status === 'active' && !dayjs().isAfter(dayjs(currentSub.endDate))
}

const hasActiveSubscription = async (thunkApi: any, subscriptionId: string) => {
  let isActive = false; 
  while (!isActive) {
    try {
      const newSubscription = await getUserSubscriptionById(thunkApi, subscriptionId);
      if (isSubscriptionActive(newSubscription)) {
        isActive = true;
      } else {
        await new Promise(resolve => {
          const timeout = setTimeout(() => {
            clearTimeout(timeout)
            resolve(true)
          }, 1000)
        });
      }
    } catch (error: any) {
      return new Promise((resolve, reject) => reject(error));
    }
  }
}

export const register = createAsyncThunk("register", async (request: RegisterRequest, thunkApi) => {
  try {

    await updateUserProfile(thunkApi, request.form);

    let pendingSubscription: any = await getUserPendingSubscriptionByTierId(thunkApi, request.tierId);

    if (!pendingSubscription) {
      const subscriptionId = await registerSubscription(thunkApi, request.tierId);
      const subscription: any = await getUserSubscriptionById(thunkApi, subscriptionId);
      if (!subscription) throw { message: 'There\'s no subscription registered' };
      if (subscription.status !== 'pending') throw { message: 'The subscription it\'s not pending' };

      const subscriptionPrice = BigNum.from_str(subscription.price.toString());
      const balance = await getUserBalance(thunkApi);

      const { lessBalance, fee } = await calculateFee(subscriptionPrice, balance);
      if (!lessBalance) {
        // do nothing; auto pay from balance
        return '';
      } else {
        return {
          fee: fee,
          subscription: subscription
        };
      }
    }
    else {
      const currentSub = await getUserSubscriptionById(thunkApi, pendingSubscription.id);
      if (isSubscriptionActive(currentSub)) {
        return thunkApi.rejectWithValue("This user is already subscribed to the tool. Please contact our support team if you are unable to access it.");
      } else if (currentSub) {
        return thunkApi.rejectWithValue("This user subscription is already in " + currentSub.status + " state. Please contact our support team for any assistance with it.")
      }
    }
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.message.toString());
  }
});

export const payForRegister = createAsyncThunk("payForRegister", async (payload: {fee: BigNum, subscription: any}, thunkApi) => {
  const { wallet, walletAddress, stakeAddress } = (thunkApi.getState() as RootState).walletConnection;
  let transactionId: string | null;
  try {
    transactionId = await doPayment(thunkApi.dispatch, wallet, walletAddress!, stakeAddress!, payload.fee);

    await hasActiveSubscription(thunkApi, payload.subscription.id).catch(error => {
      return thunkApi.rejectWithValue(error.message.toString());
    })

  } catch (error: any) {
    return thunkApi.rejectWithValue(error.message.toString());
  }

  return transactionId;
})

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
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, actions) => {
        // state.processing = false;
        // state.success = true;
        // state.transactionId = actions.payload;
        state.processing = true;
        state.success = false;
        state.transactionId = null;
      })
      .addCase(register.rejected, (state, actions) => {
        state.processing = false;
        state.errorMessage = actions.payload as string;
        state.loading = false;
      })
      .addCase(payForRegister.pending, (state, actions) => {
        state.processing = true;
        state.success = false;
        state.errorMessage = null;
        state.transactionId = null;
        state.loading = true;
      })
      .addCase(payForRegister.fulfilled, (state, actions) => {
        state.processing = false;
        state.success = true;
        state.transactionId = actions.payload;
        state.loading = false;
      })
      .addCase(payForRegister.rejected, (state, actions) => {
        state.processing = false;
        state.errorMessage = actions.payload as string;
        state.loading = false;
      })
  },
});

export const { clear } = registerSlice.actions;

export default registerSlice.reducer;
