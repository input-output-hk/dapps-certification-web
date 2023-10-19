import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosRequestHeaders, AxiosResponse } from "axios";
import { fetch } from "api";

import { setAccessToken } from "./session.slice";

import type { RootState } from "../rootReducer";

interface RepoAccessState {
  verifying: boolean;
  accessible: boolean;
  showConfirmConnection: boolean;
  accessStatus: string;
}
const initialState: RepoAccessState = {
  verifying: false,
  accessible: false,
  showConfirmConnection: false,
  accessStatus: '',
};

export const verifyRepoAccess = createAsyncThunk('verifyRepoAccess', async (payload: { owner: string, repo: string }, thunkApi) => {
  try {
    const accessToken = (thunkApi.getState() as RootState).session.accessToken;
    const headers = (accessToken ? { 'Authorization': accessToken } : {}) as AxiosRequestHeaders;
    const response = await fetch<any>(thunkApi, { method: 'GET', url: `/repo/${payload.owner}/${payload.repo}`, headers }, false);
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const getUserAccessToken = createAsyncThunk('getUserAccessToken', async (payload: { code: string }, thunkApi) => {
  const response = await fetch<{ access_token: string }>(thunkApi, { method: 'POST', url: `/github/access-token/${payload.code}` });
  await thunkApi.dispatch(setAccessToken({ accessToken: response.data.access_token }));
});

export const repoAccessSlice = createSlice({
  name: "repoAccess",
  initialState,
  reducers: {
    hideConfirmConnection: (state) => {
      state.showConfirmConnection = false;
      return state;
    },
    setRepoAccessible: (state) => {
      state.accessible = true;
      return state;
    },
    clearAccessStatus: (state) => {
      state.accessible = false;
      state.accessStatus = "";
      return state
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyRepoAccess.rejected, (state, actions) => {
        state.verifying = false;
        state.accessible = false;
        state.showConfirmConnection = true;
        state.accessStatus = "notAccessible";
      })
      .addCase(verifyRepoAccess.pending, (state, actions) => {
        state.verifying = true;
        state.accessStatus = "verifying";
        state.showConfirmConnection = false;
      })
      .addCase(verifyRepoAccess.fulfilled, (state, actions) => {
        state.accessible = true;
        state.verifying = false;
        state.accessStatus = "accessible";
        state.showConfirmConnection = false;
      })
  },
});

export const { hideConfirmConnection, setRepoAccessible, clearAccessStatus } = repoAccessSlice.actions;

export default repoAccessSlice.reducer;