import { Address, BaseAddress, RewardAddress } from "@emurgo/cardano-serialization-lib-browser";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { clearProfile } from "./profile.slice";
import { LocalStorageKeys } from "constants/constants";
import { fetchData } from "api/api";

import type { RootState } from "../rootReducer";

interface AuthState {
  isSessionFetched: boolean;
  isConnected: boolean;
  hasAnActiveSubscription: boolean;
  features: string[];
  networkId: number | null;
  wallet: any;
  walletName: string | null;
  walletAddress: string | null;
  stakeAddress: string | null;
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
  features: [],
  networkId: null,
  wallet: null,
  walletName: null,
  walletAddress: null,
  stakeAddress: null,
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

type StakeAddressHex = string;
type StakeAddressBech32 = `stake${string}`;
type ChangeAddressBech32 = `addr${string}`;

const getAddresses = async (wallet: any): Promise<[StakeAddressHex, StakeAddressBech32,ChangeAddressBech32]> => {
  const networkId = await wallet.getNetworkId();
  const changeAddrHex = await wallet.getChangeAddress();

  // derive the stake address from the change address to be sure we are getting
  // the stake address of the currently active account.
  const changeAddress = Address.from_bytes( Buffer.from(changeAddrHex, 'hex') );
  const baseChangeAddress = BaseAddress.from_address(changeAddress);
  if(!baseChangeAddress) throw new Error(`Could not derive base address from change address: ${changeAddrHex}`)
  const stakeCredential = baseChangeAddress?.stake_cred();
  if(!stakeCredential) throw new Error(`Could not derive stake credential from change address: ${changeAddrHex}`)
  const stakeAddress = RewardAddress.new(networkId, stakeCredential).to_address();

  return [
    stakeAddress.to_hex(),
    stakeAddress.to_bech32() as StakeAddressBech32,
    baseChangeAddress.to_address().to_bech32() as ChangeAddressBech32
  ];
}

export const connectWallet = createAsyncThunk('connectWallet', async (payload: { walletName: string }, { rejectWithValue, dispatch }) => {
  try {
    const { walletName } = payload;
    const wallet = await CardanoNS[walletName].enable();
    const networkId = await wallet.getNetworkId();

    const [stakeAddrHex, stakeAddrBech32, changeAddressBech32] = await getAddresses(wallet);

    const timestampRes = await fetchData.get('/server-timestamp');
    if (timestampRes.status !== 200) throw new Error();
    const timestamp = timestampRes.data;
    
    const message = `Sign this message if you are the owner of the ${changeAddressBech32} address. \n Timestamp: <<${timestamp}>> \n Expiry: 60 seconds`;

    const { key, signature } = await wallet.signData(stakeAddrHex, Buffer.from(message, 'utf8').toString('hex'));
    if (!key || !signature) throw new Error();
    
    const loginRes = await fetchData.post('/login', { address: stakeAddrBech32, key, signature });
    if (loginRes.status !== 200) throw new Error();

    localStorage.setItem(LocalStorageKeys.authToken, loginRes.data);
    localStorage.setItem(LocalStorageKeys.address, changeAddressBech32);
    localStorage.setItem(LocalStorageKeys.networkId, networkId);

    await dispatch(fetchSession({}));
    
    return { wallet, walletName, networkId, walletAddress: changeAddressBech32, stakeAddress: stakeAddrBech32 };
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
      const { wallet, stakeAddress, networkId } = (getState() as RootState).auth;
      
      if (wallet !== null && stakeAddress !== null) {
        const newStakeAddress = (await getAddresses(wallet))[1];
        forceLogout = newStakeAddress !== stakeAddress;
      }

      if (!forceLogout && wallet !== null && networkId !== null) {
        const newNetworkId = await wallet.getNetworkId();
        forceLogout = newNetworkId !== networkId;
      }

      if (forceLogout) {
        await dispatch(logout({}));
        isListening = false;
        return true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        isListening = (getState() as RootState).auth.listeningWalletChanges;
      }
    } catch (error: any) {throw new Error()}
  }
  return false;
});

export const logout = createAsyncThunk('logout', async (payload: {}, { dispatch }) => {
  dispatch(clearProfile());
  localStorage.clear();
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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
        state.stakeAddress = null;
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
        state.stakeAddress = actions.payload.stakeAddress;
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

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state = {
          ...initialState,
          isSessionFetched: true
        };
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
  },
});

export const { stopListenWalletChanges } = authSlice.actions;

export default authSlice.reducer;
