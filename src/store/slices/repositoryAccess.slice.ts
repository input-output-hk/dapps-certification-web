import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepoAccess } from "api/api";


interface RepositoryAccessState {
  verified: boolean;
  loading: boolean;
  fetched: boolean;
  clientId: string | null;
  githubToken: string | null;
}

const initialState: RepositoryAccessState = {
  verified: false,
  loading: false,
  fetched: false,
  clientId: null,
  githubToken: null,
};

export const verify = createAsyncThunk('verify', async (payload: { repo: string, owner: string }, thunkApi) => {
  try {
    await getRepoAccess.get(`/repo/${payload.owner}/${payload.repo}`);
  } catch (error) {
    return thunkApi.rejectWithValue(null);
  }
});

export const verifyWithAccessToken = createAsyncThunk('verifyWithAccessToken', async (payload: { code: string, repo: string, owner: string }, thunkApi) => {
  try {
    const accessTokenRes = await getRepoAccess.post(`/github/access-token/${payload.code}`);
    const accessToken = accessTokenRes.data.access_token;
    await getRepoAccess.get(`/repo/${payload.owner}/${payload.repo}`);
    return accessToken;
  } catch (error) {
    return thunkApi.rejectWithValue(null);
  }
});

export const fetchClientId = createAsyncThunk('fetchClientId', async (payload: {}, thunkApi) => {
  try {
    const response = await getRepoAccess.get('/github/client-id');
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(null);
  }
});

export const repositoryAccessSlice = createSlice({
  name: "repositoryAccess",
  initialState,
  reducers: {
    clear: (state) => ({ ...initialState, githubToken: state.githubToken })
  },
  extraReducers: (builder) => {
    builder

      // VERIFY
      .addCase(verify.pending, (state) => {
        state.verified = false;
        state.loading = true;
        state.fetched = false;
      })
      .addCase(verify.fulfilled, (state, actions) => {
        state.verified = true;
        state.loading = false;
        state.fetched = true;
      })
      .addCase(verify.rejected, (state) => {
        state.loading = false;
        state.fetched = true;
      })

      // VERIFY WITH ACCESS TOKEN
      .addCase(verifyWithAccessToken.pending, (state) => {
        state.verified = false;
        state.loading = true;
        state.fetched = false;
      })
      .addCase(verifyWithAccessToken.fulfilled, (state, actions) => {
        state.githubToken = actions.payload;
        state.verified = true;
        state.loading = false;
        state.fetched = true;
      })
      .addCase(verifyWithAccessToken.rejected, (state) => {
        state.loading = false;
        state.fetched = true;
      })

      // FETCH CLIENT ID
      .addCase(fetchClientId.pending, (state) => {
        state.clientId = null;
      })
      .addCase(fetchClientId.fulfilled, (state, actions) => {
        state.clientId = actions.payload;
      })
      .addCase(fetchClientId.rejected, (state) => {
        state.clientId = null;
      })
  },
});

export const { clear } = repositoryAccessSlice.actions;

export default repositoryAccessSlice.reducer;