import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";
import { setRole } from "./session.slice";

export interface UserProfile {
  address: string;
  email: string;
  fullName: string;
  companyName: string;
  contactEmail: string;
  linkedin: string | null;
  twitter: string | null;
  website: string | null;
  role: string | null;
  dapp: {
    name: string;
    owner: string;
    repo: string;
    version?: string;
    subject?: string;
    githubToken?: string;
  } | null;
}

interface ProfileState {
  profile: UserProfile | null;
  errorMessage: string | null;
  loading: boolean;
  success: boolean;
}

const initialState: ProfileState = {
  profile: null,
  errorMessage: null,
  loading: false,
  success: false,
};

export const fetchProfile = createAsyncThunk('fetchProfile', async (payload: {}, thunkApi) => {
  try {
    const response = await fetch<UserProfile>(thunkApi, { method: 'GET', url: '/profile/current' });
    if (response.status !== 200) throw new Error();
    await thunkApi.dispatch(setRole({ role: response.data.role }));
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(null);
  }
});

export const updateProfile = createAsyncThunk('updateProfile', async (data: UserProfile, thunkApi) => {
  try {
    const response = await fetch<UserProfile>(thunkApi, { method: 'PUT', url: '/profile/current', data });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return thunkApi.rejectWithValue(error.response?.data);
    }
    return thunkApi.rejectWithValue('The profile update failed, retry later');
  }
});

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // FETCH PROFILE
      .addCase(fetchProfile.fulfilled, (state, actions) => {
        state.profile = actions.payload;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.profile = null;
      })
      // UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.errorMessage = null;
        state.loading = true;
        state.success = false;
      })
      .addCase(updateProfile.fulfilled, (state, actions) => {
        state.profile = actions.payload;
        state.loading = false;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, actions) => {
        state.errorMessage = actions.payload as string;
        state.loading = false;
      })
  },
});

export const { clearProfile } = profileSlice.actions;

export default profileSlice.reducer;
