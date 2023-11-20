import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosRequestHeaders } from "axios";
import { fetch } from "api";

import { setAccessToken } from "./session.slice";

import type { RootState } from "../rootReducer";

interface RepoAccessState {
  verifying: boolean;
  accessible: boolean;
  showConfirmConnection: boolean;
  accessStatus: string | null;
  clientId: string | null;
}

const initialState: RepoAccessState = {
  verifying: false,
  accessible: false,
  showConfirmConnection: false,
  accessStatus: null,
  clientId: null,
};

export const fetchClientId = createAsyncThunk("fetchClientId", async (payload: {}, thunkApi) => {
  try {
    const response = await fetch<string>(thunkApi, { method: 'GET', url: '/github/client-id' });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const verifyRepoAccess = createAsyncThunk('verifyRepoAccess', async (payload: { owner: string, repo: string }, thunkApi) => {
  try {
    const response = await fetch<any>(thunkApi, { method: 'GET', url: `/repo/${payload.owner}/${payload.repo}` }, { useSession: false, useAccessToken: true });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const verifyRepoAccessWithAccessToken = createAsyncThunk('verifyRepoAccessWithAccessToken', async (payload: { code: string, owner: string, repo: string }, thunkApi) => {
  const response = await fetch<{ access_token: string }>(thunkApi, { method: 'POST', url: `/github/access-token/${payload.code}` });
  await thunkApi.dispatch(setAccessToken({ accessToken: response.data.access_token }));
  await thunkApi.dispatch(verifyRepoAccess({ owner: payload.owner, repo: payload.repo }));
});

export const repositoryAccessSlice = createSlice({
  name: "repositoryAccess",
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
      state.accessStatus = null;
      return state
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyRepoAccess.pending, (state) => {
        state.verifying = true;
        state.accessStatus = "verifying";
        state.showConfirmConnection = false;
      })
      .addCase(verifyRepoAccess.fulfilled, (state) => {
        state.accessible = true;
        state.verifying = false;
        state.accessStatus = "accessible";
        state.showConfirmConnection = false;
      })
      .addCase(verifyRepoAccess.rejected, (state) => {
        state.verifying = false;
        state.accessible = false;
        state.showConfirmConnection = true;
        state.accessStatus = "notAccessible";
      })
      .addCase(fetchClientId.fulfilled, (state, actions) => {
        state.clientId = actions.payload;
      })
  },
});

export const { hideConfirmConnection, setRepoAccessible, clearAccessStatus } = repositoryAccessSlice.actions;

export default repositoryAccessSlice.reducer;