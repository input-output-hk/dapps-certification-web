import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRepoAccess, fetchData } from "api/api";
import { AxiosResponse } from "axios";
import { LocalStorageKeys } from "constants/constants";

interface RepoAccessState {
  verifying: boolean;
  accessible: boolean;
  showConfirmConnection: boolean;
  accessToken: string;
  accessStatus: string;
}
const initialState: RepoAccessState = {
  verifying: false,
  accessible: false,
  showConfirmConnection: false,
  accessToken: "",
  accessStatus: "",
};

export const verifyRepoAccess = createAsyncThunk(
  "verifyRepoAccess",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await getRepoAccess.get(
        "/repo/" + payload.owner + "/" + payload.repo
      );
      return response.data;
    } catch (e: any) {
      return rejectWithValue(e.response.data);
    }
  }
);

export const getUserAccessToken = createAsyncThunk(
  "getUserAccessToken",
  async (payload: any) =>
    fetchData.post<any, AxiosResponse<{ access_token: string }>, any>(
      `/github/access-token/${payload.code}`
    )
);

export const repoAccessSlice = createSlice({
  name: "repoAccess",
  initialState,
  reducers: {
    clearStates: () => {
      localStorage.removeItem(LocalStorageKeys.accessToken);
      return initialState;
    },
    clearAccessToken: (state) => {
      state.accessToken = "";
      return state;
    },
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
      .addCase(getUserAccessToken.rejected, (state, actions) => {
        state.accessToken = "";
      })
      .addCase(getUserAccessToken.pending, (state, actions) => {})
      .addCase(getUserAccessToken.fulfilled, (state, actions) => {
        const token: string = actions.payload?.data.access_token;
        localStorage.setItem(LocalStorageKeys.accessToken, token);
        state.accessToken = token;
      });
  },
});
export const {
  clearStates,
  clearAccessToken,
  hideConfirmConnection,
  setRepoAccessible,
  clearAccessStatus
} = repoAccessSlice.actions;

export default repoAccessSlice.reducer;