import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";

import type { Run, Certificate } from 'components/CreateCertificate/CreateCertificate';

interface CertificateState {
  loading: boolean;
  certificationPrice: number | null;
  performTransaction: boolean | null;
  transactionId: string | null;
}

const initialState: CertificateState = {
  loading: false,
  certificationPrice: null,
  performTransaction: null,
  transactionId: null,
};

export const fetchDetails = createAsyncThunk("fetchDetails", async (payload: { uuid: string }, thunkApi) => {
  try {
    const balanceRes = await fetch<number>(thunkApi, { method: 'GET', url: '/profile/current/balance' });
    const availableProfileBalance = balanceRes.data;

    const detailsRes = await fetch<Run>(thunkApi, { method: 'GET', url: `/run/${payload.uuid}/details` });
    const certificationPrice = detailsRes.data.certificationPrice;

    const performTransaction = availableProfileBalance >= 0 && availableProfileBalance - certificationPrice < 0 ? true : false;
    return { certificationPrice, performTransaction };
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const submitCertificate = createAsyncThunk("submitCertificate", async (payload: { uuid: string, transactionId?: string }, thunkApi) => {
  try {
    const url = `/run/${payload.uuid}/certificate` + (payload.transactionId ? `?transactionid=${payload.transactionId}` : '');
    await fetch(thunkApi, { method: 'POST', url });
    
    let runStatus = null;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch<Run>(thunkApi, { method: 'GET', url: `/run/${payload.uuid}/details` });
      runStatus = response.data.runStatus;
    } while (runStatus === 'ready-for-certification');

    if (runStatus === 'certified') {
      const response = await fetch<Certificate>(thunkApi, { method: 'GET', url });
      return response.data.transactionId;
    }

    return null;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

const certificateSlice = createSlice({
  name: "certificate",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDetails.pending, (state) => {
        state.loading = true;
        state.certificationPrice = null;
        state.performTransaction = null;
      })
      .addCase(fetchDetails.fulfilled, (state, actions) => {
        state.loading = false;
        state.certificationPrice = actions.payload.certificationPrice;
        state.performTransaction = actions.payload.performTransaction;
      })
      .addCase(fetchDetails.rejected, (state) => {
        state.loading = false;
      })
      .addCase(submitCertificate.pending, (state, actions) => {
        state.transactionId = null;
      })
      .addCase(submitCertificate.fulfilled, (state, actions) => {
        state.transactionId = actions.payload;
      });
  },
});

export default certificateSlice.reducer;