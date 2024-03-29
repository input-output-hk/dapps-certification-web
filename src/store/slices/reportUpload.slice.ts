import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "../../api";

import type { UserProfile } from "./profile.slice";

export interface ReportUploadRequest {
  certificationLevel?: number;
  summary: string;
  disclaimer: string;
  subject?: string;
  report?: string[];
  certificateIssuer: {
    name: string;
    logo?: string;
    social: {
      contact: string;
      discord?: string;
      twitter?: string;
      github?: string;
      website: string;
    };
  };
  scripts: {
    scriptHash: string;
    contractAddress: string;
    smartContractInfo: {
      era?: string;
      compiler?: string;
      compilerVersion?: string;
      optimizer?: string;
      optimizerVersion?: string;
      progLang?: string;
      repository?: string;
    };
  }[];
}

interface ReportUploadState {
  loading: boolean;
  success: boolean;
  errorMessage: string|null;
  onchain: any|null;
  offchain: any|null;
  subject: string|null;
  uuid: string|null;
}

interface SendReportResponse {
  onchain: any;
  offchain: any;
}

const initialState: ReportUploadState = {
  loading: false,
  success: false,
  errorMessage: null,
  onchain: null,
  offchain: null,
  subject: null,
  uuid: null,
};

export const sendReport = createAsyncThunk("sendReport", async (payload: { request: ReportUploadRequest, uuid?: string, profile?: UserProfile }, thunkApi) => {
  try {
    let profileHasAddress = false;
    if (payload.profile) {
      const profileRes = await fetch<UserProfile>(thunkApi, { method: 'PUT', url: '/profile/current', data: payload.profile });
      profileHasAddress = !!profileRes.data.address;
    }

    if (payload.profile && profileHasAddress || !payload.profile) {
      const response = await fetch<SendReportResponse>(thunkApi, { method: 'POST', url: payload.uuid ? `/run/${payload.uuid}/certificate` : '/auditor/reports', data: payload.request });
      if (response.status !== 200) throw { response };
      return {
        onchain: response.data.onchain,
        offchain: response.data.offchain,
        subject: payload.request.subject,
        uuid: payload.uuid || null
      };
    }

    return null;
  } catch (error: any) {
    let errorMessage = 'Something went wrong. Please try again.';
    if (error?.response?.data) {
      errorMessage = `${error.response.statusText} - ${error.response.data}`;
    }
    return thunkApi.rejectWithValue(errorMessage);
  }
});

export const reportUploadSlice = createSlice({
  name: "reportUpload",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendReport.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.errorMessage = null;
        state.onchain = null;
        state.offchain = null;
        state.subject = null;
        state.uuid = null;
      })
      .addCase(sendReport.fulfilled, (state, actions) => {
        state.loading = false;
        if (actions.payload !== null) {
          state.success = true;
          state.onchain = actions.payload.onchain;
          state.offchain = actions.payload.offchain;
          state.subject = actions.payload.subject || null;
          state.uuid = actions.payload.uuid;
        }
      })
      .addCase(sendReport.rejected, (state, actions) => {
        state.loading = false;
        state.success = false;
        state.errorMessage = actions.payload as string;
      })
  },
});

export default reportUploadSlice.reducer;