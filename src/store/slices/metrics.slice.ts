import dayjs from "dayjs";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "../../api";

export interface AuditorReportMetric {
  date: number;
  auditLevelCount: number;
  certificateLevelCount: number;
}

interface AuditorReportRow {
  certLevel: number;
  createdAt: string;
}

export interface RunTimeMetric {
  date: number;
  avgTime: number;
  maxTime: number;
}

interface RunTimeRow {
  startTime: string;
  endTime: string;
}

export interface SubscriptionMetric {
  date: number;
  count: number;
}

interface SubscriptionRow {
  startDate: string;
  endDate: string;
}

interface MetricsState {
  auditorReportsMetrics: AuditorReportMetric[];
  runTimesMetrics: RunTimeMetric[];
  subscriptionStartedMetrics: SubscriptionMetric[];
  subscriptionEndedMetrics: SubscriptionMetric[];
}

const initialState: MetricsState = {
  auditorReportsMetrics: [],
  runTimesMetrics: [],
  subscriptionStartedMetrics: [],
  subscriptionEndedMetrics: [],
};

const CHART_TICKS = 20;

export const fetchAuditorReportsMetric = createAsyncThunk("fetchAuditorReportsMetric", async (payload: { since: dayjs.Dayjs, until: dayjs.Dayjs }, thunkApi) => {
  try {
    const response = await fetch<AuditorReportRow[]>(thunkApi, {
      method: 'POST', url: '/metrics/auditor-reports',
      data: { from: payload.since.toISOString(), to: payload.until.toISOString() }
    });

    const records = [];
    const diff = (payload.until.unix() - payload.since.unix()) / CHART_TICKS;
    for (let i = 0; i < CHART_TICKS; i++) {
      records.push({
        date: payload.since.unix() + (diff * i),
        limit: payload.since.unix() + (diff * (i+1)),
        auditLevelCount: 0,
        certificateLevelCount: 0,
      });
    }

    for (const row of response.data) {
      const date = dayjs(row.createdAt).unix();
      const record = records.find(r => date >= r.date && date < r.limit);
      if (record) {
        record.auditLevelCount += row.certLevel === 0 ? 1 : 0;
        record.certificateLevelCount += row.certLevel === 2 ? 1 : 0;
      }
    }
    
    return records;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const fetchRunTimesMetric = createAsyncThunk("fetchRunTimesMetric", async (payload: { since: dayjs.Dayjs, until: dayjs.Dayjs }, thunkApi) => {
  try {
    const response = await fetch<RunTimeRow[]>(thunkApi, {
      method: 'POST', url: '/metrics/run-times',
      data: { 
        interval: { from: payload.since.toISOString(), to: payload.until.toISOString() },
        minRunTime: 0
      }
    });

    const records = [];
    const diff = (payload.until.unix() - payload.since.unix()) / CHART_TICKS;
    for (let i = 0; i < CHART_TICKS; i++) {
      records.push({
        date: payload.since.unix() + (diff * i),
        limit: payload.since.unix() + (diff * (i+1)),
        count: 0, avgTime: 0, maxTime: 0,
      });
    }

    for (const row of response.data) {
      const date = dayjs(row.startTime).unix();
      const record = records.find(r => date >= r.date && date < r.limit);
      if (record) {
        const time = dayjs(row.endTime).unix() - dayjs(row.startTime).unix();
        if (time > record.maxTime) record.maxTime = time;
        record.count += 1;
        record.avgTime += time;
      }
    }

    for (const record of records) {
      if (record.count > 0) {
        record.avgTime = record.avgTime / record.count;
      }
    }
    
    return records;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const fetchSubscriptionsStartedMetric = createAsyncThunk("fetchSubscriptionsStartedMetric", async (payload: { since: dayjs.Dayjs, until: dayjs.Dayjs }, thunkApi) => {
  try {
    const response = await fetch<SubscriptionRow[]>(thunkApi, {
      method: 'POST', url: '/metrics/subscriptions/started/in-interval',
      data: { from: payload.since.toISOString(), to: payload.until.toISOString() }
    });

    const records = [];
    const diff = (payload.until.unix() - payload.since.unix()) / CHART_TICKS;
    for (let i = 0; i < CHART_TICKS; i++) {
      records.push({
        date: payload.since.unix() + (diff * i),
        limit: payload.since.unix() + (diff * (i+1)),
        count: 0,
      });
    }

    for (const row of response.data) {
      const date = dayjs(row.startDate).unix();
      const record = records.find(r => date >= r.date && date < r.limit);
      if (record) record.count += 1;
    }
    
    return records;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const fetchSubscriptionsEndedMetric = createAsyncThunk("fetchSubscriptionsEndedMetric", async (payload: { since: dayjs.Dayjs, until: dayjs.Dayjs }, thunkApi) => {
  try {
    const response = await fetch<SubscriptionRow[]>(thunkApi, {
      method: 'POST', url: '/metrics/subscriptions/ending/in-interval',
      data: { from: payload.since.toISOString(), to: payload.until.toISOString() }
    });
    
    const records = [];
    const diff = (payload.until.unix() - payload.since.unix()) / CHART_TICKS;
    for (let i = 0; i < CHART_TICKS; i++) {
      records.push({
        date: payload.since.unix() + (diff * i),
        limit: payload.since.unix() + (diff * (i+1)),
        count: 0,
      });
    }

    for (const row of response.data) {
      const date = dayjs(row.endDate).unix();
      const record = records.find(r => date >= r.date && date < r.limit);
      if (record) record.count += 1;
    }
    
    return records;
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
      .addCase(fetchRunTimesMetric.pending, (state) => {
        state.runTimesMetrics = [];
      })
      .addCase(fetchRunTimesMetric.fulfilled, (state, actions) => {
        state.runTimesMetrics = actions.payload;
      })
      .addCase(fetchSubscriptionsStartedMetric.pending, (state) => {
        state.subscriptionStartedMetrics = [];
      })
      .addCase(fetchSubscriptionsStartedMetric.fulfilled, (state, actions) => {
        state.subscriptionStartedMetrics = actions.payload;
      })
      .addCase(fetchSubscriptionsEndedMetric.pending, (state) => {
        state.subscriptionEndedMetrics = [];
      })
      .addCase(fetchSubscriptionsEndedMetric.fulfilled, (state, actions) => {
        state.subscriptionEndedMetrics = actions.payload;
      })
  },
});

export default metricsSlice.reducer;
