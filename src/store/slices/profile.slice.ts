import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "store/rootReducer";
import { fetch } from "../../api";
import type { Run } from 'components/CreateCertificate/CreateCertificate';
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

export interface IProfile {
  address: string;
  companyName: string;
  contactEmail: string;
  dapp: {
    githubToken: string;
    name: string;
    owner: string;
    repo: string;
    subject: string;
    version: string
  };
  email: string;
  fullName: string;
  id: number;
  linkedin: string;
  role: "no-role" | "support" | "admin";
  runStats: {
    aborted: number;
    certified: number;
    failed: number;
    queued: number;
    readyForCertification: number;
    successful: number;
    total: number
  },
  subscription: {
    adaUsdPrice: number;
    endDate: string;
    id: number;
    name: string;
    price: number;
    startDate: string;
    status: "inactive" | "active" | "pending";
    tierType: "developer" | "auditor";
  },
  twitter: string;
  website: string;
}

interface ProfileState {
  profile: UserProfile | null;
  errorMessage: string | null;
  loading: boolean;
  success: boolean;
  selectedUser: any;
  userSubscription: any;
  allUsers: IProfile[] | null;
  loadingDetails: boolean;
  loadingSubDetails: boolean;
  detailsSuccess: boolean;
  updateSuccess: boolean;
  subDetailsSuccess: boolean;
  detailsError: string | null;
  subDetailsError: string | null;
  loadingHistory: boolean;
  runHistory: Run[];
  impersonate: boolean;
  retainId: number | null;
  profileBalance: number;
}

export interface IUpdateProfile {
  companyName: string;
  contactEmail: string;
  dapp: {
    githubToken: string;
    name: string;
    owner: string;
    repo: string;
    subject: string;
    version: string;
  } | null;
  email: string;
  fullName: string;
  id: number;
  linkedin: string;
  twitter: string;
  website: string;
}

const initialState: ProfileState = {
  profile: null,
  errorMessage: null,
  loading: false,
  success: false,
  selectedUser: null,
  allUsers: null,
  loadingDetails: false,
  detailsSuccess: false,
  detailsError: null,
  userSubscription: null,
  loadingSubDetails: false,
  subDetailsSuccess: false,
  subDetailsError: null,
  updateSuccess: false,
  loadingHistory: false,
  runHistory: [],
  impersonate: false,
  retainId: null,
  profileBalance: 0
};

// Add this export to your profileSlice file
export { initialState as profileInitialState };

export const fetchProfile = createAsyncThunk('fetchProfile', async (payload, thunkApi) => {
  try {
    const {impersonate, retainId} = (thunkApi.getState() as RootState).profile;
    const response = await fetch<UserProfile>(thunkApi, { method: 'GET', url: `/profile/${impersonate ? retainId : 'current'}` });
    if (response.status !== 200) throw new Error();
    await thunkApi.dispatch(setRole({ role: response.data.role }));
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(null);
  }
});

export const updateProfile = createAsyncThunk('updateProfile', async (payload: {data: UserProfile}, thunkApi) => {
  try {
    const {impersonate, retainId} = (thunkApi.getState() as RootState).profile;
    const response = await fetch<UserProfile>(thunkApi, { method: 'PUT', url: `/profile/${impersonate ? retainId : 'current'}`, data: payload.data });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return thunkApi.rejectWithValue(error.response?.data);
    }
    return thunkApi.rejectWithValue('The profile update failed, retry later');
  }
});

export const fetchAllProfileDetails = createAsyncThunk('fetchAllProfileDetails', async (_, thunkApi) => {
  try {
    const response: any = await fetch<any>(thunkApi, { method: 'GET', url: '/profiles' });
    if (response.status !== 200) throw new Error();
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(null);
  }
});

export const fetchProfileDetails = createAsyncThunk('fetchProfileDetails', async (payload: any, thunkApi) => {
  try {
    const response = await fetch<any>(thunkApi, {
      method: "GET",
      url: `/profile/${payload}`,
    });
    if (response.status !== 200) throw new Error();

    const response1 = await fetch<any>(thunkApi, {
      method: "GET",
      url: `/profile/${payload}/roles`,
    });
    if (response1.status !== 200) throw new Error();

    return {
      ...response.data,
      role: response1.data[0] || "no-role",
    };
  } catch (error) {
    return thunkApi.rejectWithValue(null);
  }
});

export const updateProfileDetails = createAsyncThunk('updateProfileDetails', async ({ id, data }: any, thunkApi) => {
  try {
    const response = await fetch<any>(thunkApi, {
      method: "PUT",
      url: `/profile/${id}`,
      data,
    });

    if (response.status !== 200) throw new Error();

    const response1 = await fetch<any>(thunkApi, {
      method: "PUT",
      url: `/profile/${id}/roles`,
      data: [data.role],
    });
    if (response1.status >= 400) throw new Error();

    return {
      ...response.data,
      role: data.role,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return thunkApi.rejectWithValue(error.response?.data);
    }
    return thunkApi.rejectWithValue("The profile update failed, retry later");
  }
});

export const fetchProfileSubscriptionDetails = createAsyncThunk('fetchProfileSubscriptionDetails', async (payload: any, thunkApi) => {
  try {
    const response = await fetch<any>(thunkApi, { method: 'GET', url: `/profile/${payload}/subscriptions?just-enabled=true` });
    if (response.status !== 200) throw new Error();
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(null);
  }
});

export const fetchProfileRunHistory = createAsyncThunk("fetchProfileRunHistory", async( payload: any, thunkApi) => {
  try {
    const response = await fetch<Run[]>(thunkApi, { method: 'GET', url: `/profile/${payload}/runs` });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
})

export const fetchProfileBalance = createAsyncThunk("fetchProfileBalance", async( payload: any, thunkApi) => {
  try {
    const res: any = await fetch<number>(thunkApi, { method: 'GET', url: '/profile/current/balance' });
    if (res.status !== 200) throw { message: res.data };
    return res.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
})

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: () => initialState,
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSuccess: (state) => {
      state.updateSuccess = false;
    },
    setImpersonate: (state, { payload }) => {
      state.impersonate = payload.status;
      state.retainId = payload.id;
    }
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
      // FETCH ALL PROFILES
      .addCase(fetchAllProfileDetails.pending, (state) => {
        state.detailsError = null;
        state.loadingDetails = true;
        state.detailsSuccess = false;
      })
      .addCase(fetchAllProfileDetails.fulfilled, (state, actions) => {
        state.allUsers = actions.payload;
        state.loadingDetails = false;
        state.detailsSuccess = true;
        state.selectedUser = null;
      })
      .addCase(fetchAllProfileDetails.rejected, (state, actions) => {
        state.allUsers = null;
        state.loadingDetails = false;
        state.detailsError = actions.payload as string;
      })
      // FETCH ANOTHER PROFILE
      .addCase(fetchProfileDetails.pending, (state) => {
        state.detailsError = null;
        state.loadingDetails = true;
        state.detailsSuccess = false;
      })
      .addCase(fetchProfileDetails.fulfilled, (state, actions) => {
        state.selectedUser = actions.payload;
        state.loadingDetails = false;
        state.detailsSuccess = true;
      })
      .addCase(fetchProfileDetails.rejected, (state, actions) => {
        state.selectedUser = null;
        state.loadingDetails = false;
        state.detailsError = actions.payload as string;
      })
      // UPDATE ANOTHER PROFILE
      .addCase(updateProfileDetails.pending, (state) => {
        state.detailsError = null;
        state.loadingDetails = true;
        state.updateSuccess = false;
      })
      .addCase(updateProfileDetails.fulfilled, (state, actions) => {
        state.selectedUser = actions.payload;
        state.loadingDetails = false;
        state.updateSuccess = true;
      })
      .addCase(updateProfileDetails.rejected, (state, actions) => {
        state.detailsError = actions.payload as string;
        state.loadingDetails = false;
      })
      // FETCH ANOTHER USER SUBSCRIPTION
      .addCase(fetchProfileSubscriptionDetails.pending, (state) => {
        state.subDetailsError = null;
        state.loadingSubDetails = true;
        state.subDetailsSuccess = false;
      })
      .addCase(fetchProfileSubscriptionDetails.fulfilled, (state, actions) => {
        state.userSubscription = actions.payload;
        state.loadingSubDetails = false;
        state.subDetailsSuccess = true;
      })
      .addCase(fetchProfileSubscriptionDetails.rejected, (state, actions) => {
        state.userSubscription = null;
        state.loadingSubDetails = false;
        state.subDetailsError = actions.payload as string;
      })
      .addCase(fetchProfileRunHistory.pending, (state) => {
        state.loadingHistory = true;
        state.runHistory = [];
      })
      .addCase(fetchProfileRunHistory.fulfilled, (state, actions) => {
        state.loadingHistory = false;
        state.runHistory = actions.payload;
      })
      .addCase(fetchProfileRunHistory.rejected, (state) => {
        state.loadingHistory = false;
        state.runHistory = [];
      })
      .addCase(fetchProfileBalance.pending, (state) => {
        state.profileBalance = 0;
      })
      .addCase(fetchProfileBalance.fulfilled, (state, actions) => {
        state.profileBalance = actions.payload;
      })
      .addCase(fetchProfileBalance.rejected, (state, actions) => {
        state.profileBalance = 0;
      })
  },
});

export const { clearProfile, setSelectedUser, clearSuccess, setImpersonate } = profileSlice.actions;

export default profileSlice.reducer;
