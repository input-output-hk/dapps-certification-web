import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "../../api";

export const fetchCertificationResult = createAsyncThunk("fetchCertificationResult", async (payload: { uuid: string }, thunkApi) => {
  try {
    const response = await fetch<any>(thunkApi, { method: 'GET', url: `/run/${payload.uuid}` });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const certificationResultSlice = createSlice({
  name: "certificationResult",
  initialState: {},
  reducers: {},
});

export default certificationResultSlice.reducer;
