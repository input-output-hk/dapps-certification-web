import dayjs from "dayjs";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { formatTimeToReadable } from "utils/utils";
import { fetch } from "../../api";

interface RunTimeState {
  startTime: string;
  endTime: string;
  runState: string;
  ended: number;
  buildInfo: {
    runTime: string;
    runState: string;
  }
}

const initialState: RunTimeState = {
  startTime: "",
  endTime: "",
  runState: "",
  ended: 0,
  buildInfo: {
    runTime: "",
    runState: ""
  }
};

export const fetchLogs = createAsyncThunk("fetchLogs", async (payload: { uuid: string, queryAfter: string }, thunkApi) => {
  try {
    const response = await fetch<any>(thunkApi, { method: 'GET', url: `/run/${payload.uuid}/logs${payload.queryAfter}` });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const runTimeSlice = createSlice({
  name: "runTime",
  initialState,
  reducers: {
    setStartTime: (state, {payload}) => {
      state.startTime = payload.startTime;
    },
    setEndTime: (state, {payload}) => {
      state.endTime = payload.endTime;
    },
    setRunState: (state, {payload}) => {
      state.runState = payload.runState;
    },
    setStates: (state, {payload}) => {
      state.startTime = payload.startTime;
      state.endTime = payload.endTime;
      state.runState = payload.runState;
    },
    setEnded: (state, {payload}) => {
        state.ended = payload
    },
    setBuildInfo: (state) => {
      const msDiff: number = dayjs(state.endTime).diff(dayjs(state.startTime))
      const timeStr: any = formatTimeToReadable(msDiff)
      state.buildInfo = {
        'runTime': timeStr,
        'runState': state.runState
      }
    },
    clearStates: () => initialState,
  },
});
export const { setStartTime, setEndTime, setRunState, setStates, setEnded, setBuildInfo, clearStates } = runTimeSlice.actions;

export default runTimeSlice.reducer;
