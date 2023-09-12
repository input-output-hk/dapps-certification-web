import { Address } from "@emurgo/cardano-serialization-lib-browser";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LocalStorageKeys } from "constants/constants";
import { fetchData } from "api/api";

import type { RootState } from "../rootReducer";

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
  isConnected: boolean;
  hasAnActiveSubscription: boolean;
  profile: UserProfile | null;
  features: string[];
  networkId: number | null;
  wallet: any;
  walletName: string | null;
  walletAddress: string | null;
  activeWallets: string[];
  errorMessage: string | null;
  errorRetry: boolean;
  loading: boolean;
  listeningWalletChanges: boolean;
  resetWalletChanges: boolean;
}

const initialState: AuthState = {
  isSessionFetched: false,
  isConnected: false,
  hasAnActiveSubscription: false,
  profile: null,
  features: [],
  networkId: null,
  wallet: null,
  walletName: null,
  walletAddress: null,
  activeWallets: ['lace', 'nami', 'yoroi'],
  errorMessage: null,
  errorRetry: false,
  loading: false,
  listeningWalletChanges: false,
  resetWalletChanges: false,
};

declare global {
  interface Window {
    cardano: any;
  }
}

const CardanoNS = window.cardano;

export const connectWallet = createAsyncThunk('connectWallet', async (payload: { walletName: string }, { rejectWithValue, dispatch }) => {
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

    const { key, signature } = await wallet.signData(response, Buffer.from(message, 'utf8').toString('hex'));
    if (!key || !signature) throw new Error();
    
    const loginRes = await fetchData.post('/login', { address, key, signature });
    if (loginRes.status !== 200) throw new Error();
    localStorage.setItem(LocalStorageKeys.authToken, loginRes.data);

    const res = await dispatch(fetchSession({}));
    
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

export const fetchSession = createAsyncThunk('fetchSession', async (payload: any, { rejectWithValue }) => {
  try {
    const response = await fetchData.get('/profile/current/subscriptions/active-features');
    if (response.status !== 200) throw new Error();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const startListenWalletChanges = createAsyncThunk('listenWalletChanges', async (payload: any, { dispatch, getState }) => {
  let isListening = true;
  while (isListening) {
    try {
      let forceLogout = false;
      const { wallet, walletAddress, networkId } = (getState() as RootState).auth;
      
      if (wallet !== null && walletAddress !== null) {
        const response = await wallet.getChangeAddress();
        const newAddress = Address.from_bytes(Buffer.from(response, 'hex')).to_bech32();
        forceLogout = newAddress !== walletAddress;
      }

      if (!forceLogout && wallet !== null && networkId !== null) {
        const newNetworkId = await wallet.getNetworkId();
        forceLogout = newNetworkId !== networkId;
      }

      if (forceLogout) {
        await dispatch(logout());
        isListening = false;
        return true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        isListening = (getState() as RootState).auth.listeningWalletChanges;
      }
    } catch (error: any) {}
  }
  return false;
});

export const fetchProfile = createAsyncThunk('fetchProfile', async (payload: any, { rejectWithValue }) => {
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
      return {
        ...initialState,
        isSessionFetched: true
      };
    },
    stopListenWalletChanges: (state) => {
      return {
        ...state,
        listeningWalletChanges: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // CONNECT WALLET
      .addCase(connectWallet.pending, (state) => {
        state.isConnected = false;
        state.networkId = null;
        state.wallet = null;
        state.walletName = null;
        state.walletAddress = null;
        state.errorMessage = null;
        state.errorRetry = false;
        state.loading = true;
        state.resetWalletChanges = false;
        state.listeningWalletChanges = false;
      })
      .addCase(connectWallet.fulfilled, (state, actions) => {
        state.isConnected = true;
        state.networkId = actions.payload.networkId;
        state.wallet = actions.payload.wallet;
        state.walletName = actions.payload.walletName;
        state.walletAddress = actions.payload.walletAddress;
        state.loading = false;
      })
      .addCase(connectWallet.rejected, (state, actions) => {
        state.errorMessage = (actions.payload as any).message;
        state.errorRetry = (actions.payload as any).showRetry;
        state.loading = false;
      })

      // FETCH SESSION
      .addCase(fetchSession.pending, (state) => {
        state.features = [];
        state.hasAnActiveSubscription = false;
        state.isSessionFetched = false;
      })
      .addCase(fetchSession.fulfilled, (state, actions) => {
        state.features = actions.payload;
        state.hasAnActiveSubscription = state.features.includes('l2-upload-report') && state.features.includes('l1-run');
        state.isSessionFetched = true;
      })
      .addCase(fetchSession.rejected, (state) => {
        state.isSessionFetched = true;
      })

      // START LISTEN WALLET CHANGES
      .addCase(startListenWalletChanges.pending, (state) => {
        state.listeningWalletChanges = true;
        state.resetWalletChanges = false;
      })
      .addCase(startListenWalletChanges.fulfilled, (state, actions) => {
        state.listeningWalletChanges = false;
        state.resetWalletChanges = actions.payload;
      })
      .addCase(startListenWalletChanges.rejected, (state) => {
        state.listeningWalletChanges = false;
        state.resetWalletChanges = false;
      })

      // FETCH PROFILE
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

export const { logout, stopListenWalletChanges } = authSlice.actions;

export default authSlice.reducer;