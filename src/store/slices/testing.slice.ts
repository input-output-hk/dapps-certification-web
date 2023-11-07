import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";

import { updateProfile } from "store/slices/profile.slice";
import { clearAccessToken } from "store/slices/session.slice";

import type { RootState } from "store/rootReducer";

export interface TestingForm {
  repoUrl: string;
  commitHash: string;
  name: string;
  version: string;
}

interface TestingState {
  form: TestingForm | null;
  uuid: string | null;
  loadingUuid: boolean;
}

const initialState: TestingState = {
  form: null,
  uuid: null,
  loadingUuid: false,
};

export const fetchCertification = createAsyncThunk("fetchCertification", async (payload: {}, thunkApi) => {
  try {
    const form = (thunkApi.getState() as RootState).testing.form!;
    const [, , , owner, repo] = form.repoUrl.split('/');
    const profile = (thunkApi.getState() as RootState).profile.profile!;
    const githubToken = (thunkApi.getState() as RootState).session.accessToken || undefined;
    await thunkApi.dispatch(updateProfile({
      ...profile, dapp: { ...profile.dapp, name: form.name, owner, repo, githubToken }
    }));
    await thunkApi.dispatch(clearAccessToken({}));

    const response = await fetch<string>(thunkApi, {
      method: 'POST', url: '/run', data: form.commitHash,
      headers: {'Content-type': 'text/plain;charset=utf-8'}
    });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const testingSlice = createSlice({
  name: "testing",
  initialState,
  reducers: {
    resetForm: () => initialState,
    updateForm: (state, actions) => ({
      ...state, form: actions.payload
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertification.pending, (state) => {
        state.uuid = null;
        state.loadingUuid = true;
      })
      .addCase(fetchCertification.fulfilled, (state, actions) => {
        state.uuid = actions.payload;
        state.loadingUuid = false;
      })
      .addCase(fetchCertification.rejected, (state) => {
        state.uuid = null;
        state.loadingUuid = false;
      })
  },
});

export const { updateForm, resetForm } = testingSlice.actions;

export default testingSlice.reducer;