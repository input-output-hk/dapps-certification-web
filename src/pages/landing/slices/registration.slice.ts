import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "api/api";

import type { RegistrationForm } from "../components/RegisterSection";

export interface RegisterRequest {
  form: RegistrationForm;
  tierId: string;
}

interface RegistrationState {
  sent: boolean;
  success: boolean;
}

const initialState: RegistrationState = {
  sent: false,
  success: false,
};

export const register = createAsyncThunk("register", async (request: RegisterRequest, { rejectWithValue }) => {
  try {

    // TODO: FIX THE REQUEST BODY

    const profileResponse = await fetchData.put('/profile/current', request.form);
    console.log(profileResponse.data);

    const subscriptionResponse = await fetchData.post(`/profile/current/subscriptions/${request.tierId}`);
    console.log(subscriptionResponse.data);

    return {};

  } catch (e: any) {
    return rejectWithValue(e.response.data);
  }
});

export const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.sent = false;
        state.success = false;
      })
      .addCase(register.fulfilled, (state, actions) => {
        state.sent = true;
        state.success = true;
      })
      .addCase(register.rejected, (state, actions) => {
        state.sent = true;
        state.success = false;
      })
  },
});

export default registrationSlice.reducer;
