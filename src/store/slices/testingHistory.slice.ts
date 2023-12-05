import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";

import { processFinishedJson } from "compositions/Timeline/components/TimelineItem/timeline.helper";
import { isAnyTaskFailure } from "pages/certification/Certification.helper";

import type { Run } from 'components/CreateCertificate/CreateCertificate';

export interface Certificate {
  transactionId: string;
}

interface TestingHistoryState {
  loading: boolean;
  history: Run[];
  certificates: Map<string, Certificate>;
}

const initialState: TestingHistoryState = {
  loading: false,
  history: [],
  certificates: new Map(),
};

export const fetchHistory = createAsyncThunk("fetchHistory", async (payload: {}, thunkApi) => {
  try {
    const response = await fetch<Run[]>(thunkApi, { method: 'GET', url: '/run' });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const getRowStatus = createAsyncThunk("getRowStatus", async (payload: { runId: string }, thunkApi) => {
  try {
    const response = await fetch<any>(thunkApi, { method: 'GET', url: `/run/${payload.runId}` });
    const state = response.data.hasOwnProperty("state") ? response.data.state : "";
    let status: string = 'queued';
    if (state === 'failed') {
      status = 'failed'
    } else if (response.data.status === 'finished') {
      const isArrayResult = Array.isArray(response.data.result)
      const resultJson = isArrayResult ? response.data.result[0] : response.data.result;
      const isUnitTestSuccess = processFinishedJson(resultJson);
      const isComplete = isUnitTestSuccess && !isAnyTaskFailure(resultJson);
      status = isComplete ? 'succeeded' : 'failed';
    }
    return { runId: payload.runId, status };
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const fetchCertificate = createAsyncThunk("fetchCertificate", async (payload: { runId: string }, thunkApi) => {
  try {
    const response = await fetch<Certificate>(thunkApi, { method: 'GET', url: `/run/${payload.runId}/certificate` });
    if (response.status !== 200) throw new Error();
    return {
      runId: payload.runId,
      certificate: response.data
    };
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const deleteTestHistoryData = createAsyncThunk("deleteTestHistoryData", async (payload: { url: string }, thunkApi) => {
  try {
    const response = await fetch(thunkApi, { method: 'DELETE', url: payload.url });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

const testingHistorySlice = createSlice({
  name: "testingHistory",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.history = [];
      })
      .addCase(fetchHistory.fulfilled, (state, actions) => {
        state.loading = false;
        state.history = actions.payload;
      })
      .addCase(fetchHistory.rejected, (state) => {
        state.loading = false;
        state.history = [];
      })
      .addCase(getRowStatus.fulfilled, (state, actions) => {
        state.history = state.history.map(
          row => row.runId !== actions.payload.runId ? row : ({
            ...row, runStatus: actions.payload.status as any
          })
        );
      })
      .addCase(fetchCertificate.fulfilled, (state, actions) => {
        state.certificates.set(actions.payload.runId, actions.payload.certificate);
      });
  },
});

export default testingHistorySlice.reducer;