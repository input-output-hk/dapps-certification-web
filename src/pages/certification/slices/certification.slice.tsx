import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";

interface CertificationState {
  uuid: string;
  repoUrl: string;
}

const initialState: CertificationState = {
  uuid: "",
  repoUrl: ""
};

export const fetchCertification = createAsyncThunk("fetchCertification", async (payload: { uuid: string }, thunkApi) => {
  try {
    const response = await fetch<any>(thunkApi, { method: 'GET', url: `/run/${payload.uuid}` });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const certificationSlice = createSlice({
  name: "certification",
  initialState,
  reducers: {
    setUuid: (state, action) => {
      state.uuid = action.payload;
    },
    clearUuid: (state) => {
      state.uuid = "";
      return state;
    },
    setRepoUrl: (state, action) => {
      state.repoUrl = action.payload;
    },
    clearRepoUrl: (state) => {
      state.repoUrl = "";
      return state;
    },
  },
});

export const { setUuid, clearUuid, setRepoUrl, clearRepoUrl } = certificationSlice.actions;

export default certificationSlice.reducer;