import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "api/api";

export interface UserProfile {
  address?: string;
  email?: string;
  fullName?: string;
  companyName?: string;
  contactEmail?: string;
  linkedin?: string | null;
  twitter?: string | null;
  website?: string | null;
  dapp?: {
    name: string;
    owner: string;
    repo: string;
    version: string;
    githubToken?: string;
    subject?: string;
  } | null;
}

interface ProfileState {
  profile: UserProfile | null;
  isProfileUpdatedLocally: boolean;
  needsToValidateRepository: boolean;
  errorMessage: string | null;
  loading: boolean;
  success: boolean;
}

const initialState: ProfileState = {
  profile: null,
  isProfileUpdatedLocally: false,
  needsToValidateRepository: false,
  errorMessage: null,
  loading: false,
  success: false,
};

export const fetchProfile = createAsyncThunk('fetchProfile', async (payload: {}, thunkApi) => {
  try {
    const response = await fetchData.get('/profile/current');
    if (response.status !== 200) throw new Error();
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(null);
  }
});

export const updateProfile = createAsyncThunk('updateProfile', async (data: UserProfile, thunkApi) => {
  try {
    const response = await fetchData.put('/profile/current', data);
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
    updateProfileLocally: (state, actions) => ({
      ...initialState,
      profile: actions.payload,
      isProfileUpdatedLocally: true,
      needsToValidateRepository: (
        state.needsToValidateRepository ||
        actions.payload.dapp.repo !== state.profile?.dapp?.repo ||
        actions.payload.dapp.owner !== state.profile?.dapp?.owner
      ),
    })
  },
  extraReducers: (builder) => {
    builder
      // FETCH PROFILE
      .addCase(fetchProfile.fulfilled, (state, actions) => {
        if (!state.needsToValidateRepository) {
          state.profile = actions.payload;
        } else {
          state.profile = { ...actions.payload, dapp: state.profile?.dapp || null };
        }
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
        state.needsToValidateRepository = false;
        state.isProfileUpdatedLocally = false;
        state.loading = false;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, actions) => {
        state.errorMessage = actions.payload as string;
        state.loading = false;
      })
  },
});

export const { clearProfile, updateProfileLocally } = profileSlice.actions;

export default profileSlice.reducer;