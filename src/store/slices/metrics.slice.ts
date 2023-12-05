import dayjs from "dayjs";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";

export interface AuditorReportMetric {
  date: number;
  auditLevel: number;
  certificateLevel: number;
}

interface AuditorReportRow {
  certLevel: number;
  createdAt: string;
}

export interface RunTimeMetric {
  since: number;
  until: number;
}

interface RunTimeRow {
  endTime: string;
  startTime: string;
}

interface MetricsState {
  auditorReportsMetrics: AuditorReportMetric[];
  runTimesMetrics: RunTimeMetric[];
}

const initialState: MetricsState = {
  auditorReportsMetrics: [],
  runTimesMetrics: [],
};

export const fetchAuditorReportsMetric = createAsyncThunk("fetchAuditorReportsMetric", async (data: { from: string, to: string }, thunkApi) => {
  try {
    const response = await fetch<AuditorReportRow[]>(thunkApi, { method: 'POST', url: '/metrics/auditor-reports', data });
    const results = response.data.map(report => ({
      date: dayjs(report.createdAt).unix(),
      auditLevel: report.certLevel === 0 ? 1 : 0,
      certificateLevel: report.certLevel === 2 ? 1 : 0,
    }));
    const grouped = [{
      date: dayjs(data.from).unix(),
      auditLevel: 0,
      certificateLevel: 0,
    },{
      date: dayjs(data.to).unix(),
      auditLevel: 0,
      certificateLevel: 0,
    }];
    for (const r of results) {
      const g = grouped.find(g => g.date === r.date);
      if (g) {
        g.auditLevel += r.auditLevel;
        g.certificateLevel += r.certificateLevel;
      } else {
        grouped.push(r);
      }
    }
    return grouped.sort((a, b) => a.date - b.date);
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const fetchRunTimesMetric = createAsyncThunk("fetchRunTimesMetric", async (data: { from: string, to: string }, thunkApi) => {
  try {
    const response = await fetch<RunTimeRow[]>(thunkApi, { method: 'POST', url: '/metrics/run-times', data: { interval: data, minRunTime: 0 }});
    const results = response.data.map(report => ({
      since: dayjs(report.startTime).unix(),
      until: dayjs(report.endTime).unix(),
    }));
    return results.sort((a, b) => a.since - b.since);
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditorReportsMetric.pending, (state) => {
        state.auditorReportsMetrics = [];
      })
      .addCase(fetchAuditorReportsMetric.fulfilled, (state, actions) => {
        state.auditorReportsMetrics = actions.payload;
      })
      .addCase(fetchAuditorReportsMetric.rejected, (state, actions) => {
        state.auditorReportsMetrics = [];
      })
      .addCase(fetchRunTimesMetric.pending, (state) => {
        state.runTimesMetrics = [];
      })
      .addCase(fetchRunTimesMetric.fulfilled, (state, actions) => {
        state.runTimesMetrics = actions.payload;
      })
      .addCase(fetchRunTimesMetric.rejected, (state, actions) => {
        state.runTimesMetrics = [];
      })
  },
});

export default metricsSlice.reducer;
