import { Address } from "@emurgo/cardano-serialization-lib-browser";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LocalStorageKeys } from "constants/constants";
import { fetchData } from "api/api";

export interface UserProfile {
  authors?: string;
  contacts?: string;
  dapp: {
    name: string;
    owner: string;
    repo: string;
    version: string;
    githubToken?: string | null;
  } | null;
  linkedin?: string;
  twitter?: string;
  vendor?: string;
  website?: string;
}

interface AuthState {
  isSessionFetched: boolean;
  isLoggedIn: boolean;
  hasAnActiveSubscription: boolean;
  profile: UserProfile | null;
  features: string[];
  networkId: number | null;
  wallet: any;
  walletName: string | null;
  walletAddress: string | null;
  activeWallets: string[];
  error: boolean;
  errorMessage: string | null;
}

const initialState: AuthState = {
  isSessionFetched: false,
  isLoggedIn: false,
  hasAnActiveSubscription: false,
  profile: null,
  features: [],
  networkId: null,
  wallet: null,
  walletName: null,
  walletAddress: null,
  activeWallets: ['lace', 'nami', 'yoroi'],
  error: false,
  errorMessage: null,
};

declare global {
  interface Window {
    cardano: any;
  }
}

const CardanoNS = window.cardano;

export const connectWallet = createAsyncThunk('connectWallet', async (payload: { walletName: string }, { rejectWithValue }) => {
  try {
    const { walletName } = payload;
    const wallet = await CardanoNS[walletName].enable();
    const networkId = await wallet.getNetworkId();

    const response = await wallet.getChangeAddress();
    const address = Address.from_bytes(Buffer.from(response, 'hex')).to_bech32();

    const timestampRes = await fetchData.get('/server-timestamp');
    if (timestampRes.status !== 200) throw new Error();
    const timestamp = timestampRes.data;
    
    const message = `Sign this message if you are the owner of the ${address} address. \n Timestamp: <<${timestamp}>> \n Expiry: 60 seconds`;

    const { key, signature } = await wallet.signData(address, Buffer.from(message, 'utf8').toString('hex'));
    if (!key || !signature) throw new Error();
    
    const loginRes = await fetchData.post('/login', { address, key, signature });
    if (loginRes.status !== 200) throw new Error();
    localStorage.setItem(LocalStorageKeys.authToken, loginRes.data);
    
    return { wallet, walletName, networkId, walletAddress: address };
  } catch (error: any) {
    const payload = {
      showRetry: true,
      message: 'Could not obtain the proper key and signature for the wallet. Please try connecting again.'
    };
    if (error.info) {
      payload.showRetry = error.code === 3;
      payload.message = error.info;
    }
    if (error.response) {
      error.showRetry = error.status === 403;
      error.message = error.response.data || 'An error ocurred.';
    }
    return rejectWithValue(payload);
  }
});

export const fetchSession = createAsyncThunk('fetchSession', async ({}, { rejectWithValue }) => {
  try {
    const response = await fetchData.get('/profile/current/subscriptions/active-features');
    if (response.status !== 200) throw new Error();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const fetchProfile = createAsyncThunk('fetchProfile', async ({}, { rejectWithValue }) => {
  try {
    const response = await fetchData.get('/profile/current');
    if (response.status !== 200) throw new Error();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.clear();
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isLoggedIn = false;
        state.isSessionFetched = false;
        state.hasAnActiveSubscription = false;
        state.features = [];
        state.profile = null;
        state.networkId = null;
        state.wallet = null;
        state.walletName = null;
        state.walletAddress = null;
        state.error = false;
        state.errorMessage = null;
      })
      .addCase(connectWallet.fulfilled, (state, actions) => {
        state.isLoggedIn = true;
        state.networkId = actions.payload.networkId;
        state.wallet = actions.payload.wallet;
        state.walletName = actions.payload.walletName;
        state.walletAddress = actions.payload.walletAddress;
      })
      .addCase(connectWallet.rejected, (state, actions) => {
        state.error = true;
        state.errorMessage = actions.payload as string;
      })
      .addCase(fetchSession.pending, (state) => {
        state.features = [];
        state.hasAnActiveSubscription = false;
        state.isSessionFetched = false;
        state.isLoggedIn = false;
      })
      .addCase(fetchSession.fulfilled, (state, actions) => {
        state.features = actions.payload;
        state.hasAnActiveSubscription = state.features.includes('l2-upload-report') && state.features.includes('l1-run');
        state.isSessionFetched = true;
        state.isLoggedIn = true;
      })
      .addCase(fetchSession.rejected, (state) => {
        state.isSessionFetched = true;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.profile = null;
      })
      .addCase(fetchProfile.fulfilled, (state, actions) => {
        state.profile = actions.payload;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.profile = null;
      })
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;