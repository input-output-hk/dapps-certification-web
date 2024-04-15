import { Address, BaseAddress, RewardAddress } from "@emurgo/cardano-serialization-lib-browser";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchActiveSubscription, logout } from "store/slices/auth.slice";
import { setSession } from "store/slices/session.slice";
import { fetch } from "../../api";

import type { RootState } from "../rootReducer";

declare global {
  interface Window {
    cardano: any;
  }
}

interface WalletConnectionState {
  wallet: any | null;
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

const initialState: WalletConnectionState = {
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

// Add this export to your walletConnectionSlice file
export { initialState as walletConnectionInitialState };

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

export const connectWallet = createAsyncThunk('connectWallet', async (payload: { walletName: string }, thunkApi) => {
  const CardanoNS = window.cardano;

  try {
    const { walletName } = payload;
    const wallet = await CardanoNS[walletName].enable();
    const networkId = await wallet.getNetworkId();

    const [stakeAddrHex, stakeAddrBech32, changeAddressBech32] = await getAddresses(wallet);

    const timestampRes = await fetch<number>(thunkApi, { method: 'GET', url: '/server-timestamp' });
    if (timestampRes.status !== 200) throw new Error();
    const timestamp = timestampRes.data;
    
    const message = `Sign this message if you are the owner of the ${changeAddressBech32} address. \n Timestamp: <<${timestamp}>> \n Expiry: 60 seconds`;

    const { key, signature } = await wallet.signData(stakeAddrHex, Buffer.from(message, 'utf8').toString('hex'));
    if (!key || !signature) throw new Error();
    
    const loginRes = await fetch<string>(thunkApi, { method: 'POST', url: '/login', data: { address: stakeAddrBech32, key, signature } });
    if (loginRes.status !== 200) throw new Error();

    thunkApi.dispatch(setSession({
      authToken: loginRes.data,
      networkId: networkId,
      walletAddress: changeAddressBech32
    }));

    await thunkApi.dispatch(fetchActiveSubscription());
    
    return { wallet, walletName, walletAddress: changeAddressBech32, stakeAddress: stakeAddrBech32 };
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
    return thunkApi.rejectWithValue(payload);
  }
});

export const startListenWalletChanges = createAsyncThunk('listenWalletChanges', async (payload: any, { dispatch, getState }) => {
  const CardanoNS = window.cardano;
  const { authToken, networkId } = (getState() as RootState).session;
  const { wallet, walletName, stakeAddress } = (getState() as RootState).walletConnection;
  
  if (authToken || wallet.getNetworkId === undefined) {
    let isListening = true;
    while (isListening) {
      try {
        let forceLogout = false;

        if (wallet.getNetworkId === undefined) {
          isListening = false;
        }

        if (!wallet.getNetworkId) {
          await dispatch(updateWallet(await CardanoNS[walletName!].enable()));
        } else {
          if (wallet !== null && stakeAddress !== null) {
            const newStakeAddress = (await getAddresses(wallet))[1];
            forceLogout = newStakeAddress !== stakeAddress;
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
            isListening = (getState() as RootState).walletConnection.listeningWalletChanges;
          }
        }
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } else {
    // don't listen as a wallet is not connected to 
  }
  return false;
});

export const walletConnectionSlice = createSlice({
  name: "walletConnection",
  initialState,
  reducers: {
    stopListenWalletChanges: (state) => ({
      ...state,
      listeningWalletChanges: false
    }),
    updateWallet: (state, action) => ({
      ...state,
      wallet: action.payload
    })
  },
  extraReducers: (builder) => {
    builder
    
      // CONNECT WALLET
      .addCase(connectWallet.pending, (state) => {
        state.wallet = null;
        state.walletName = null;
        state.walletAddress = null;
        state.stakeAddress = null;
        state.errorMessage = null;
        state.errorRetry = false;
        state.loading = true;
        state.listeningWalletChanges = false;
        state.resetWalletChanges = false;
      })
      .addCase(connectWallet.fulfilled, (state, actions) => {
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

export const { stopListenWalletChanges, updateWallet } = walletConnectionSlice.actions;

export default walletConnectionSlice.reducer;
