import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "api";

import { updateProfile } from "store/slices/profile.slice";
import { clearAccessToken } from "store/slices/session.slice";

import { isAnyTaskFailure } from "pages/certification/Certification.helper";
import { TIMELINE_CONFIG } from "compositions/Timeline/timeline.config";
import { processTimeLineConfig, getPlannedTestingTasks, processFinishedJson } from "compositions/Timeline/components/TimelineItem/timeline.helper";

import type { RootState } from "store/rootReducer";
import type { PlanObj } from "pages/certification/Certification.helper";

export interface TestingForm {
  repoUrl?: string;
  commitHash?: string;
  name?: string;
  version?: string;
  subject?: string;
}

export interface RunStatus {
  status: string;
  state?: string;
  result: any;
  progress: any;
  plan: any;
}

interface TestingState {
  form: TestingForm | null;
  creating: boolean;
  uuid: string | null;
  fetching: boolean;
  timelineConfig: any;
  plannedTestingTasks: PlanObj[];
  coverageFile: any;
  resultData: any;
  runEnded: boolean;
  runStatus: string | null;
  runState: string | null;
  unitTestSuccess: boolean;
  hasFailedTasks: boolean;
  refetchMin: number;
  shouldFetchRunStatus: boolean;
  resetForm: string | null;
}

const initialState: TestingState = {
  form: null,
  creating: false,
  uuid: null,
  fetching: false,
  timelineConfig: TIMELINE_CONFIG,
  plannedTestingTasks: [],
  coverageFile: null,
  resultData: null,
  runEnded: false,
  runStatus: null,
  runState: null,
  unitTestSuccess: true,
  hasFailedTasks: false,
  refetchMin: 5,
  shouldFetchRunStatus: false,
  resetForm: null
};

export const createTestRun = createAsyncThunk("createTestRun", async (payload: {}, thunkApi) => {
  try {
    const form = (thunkApi.getState() as RootState).testing.form!;
    const [, , , owner, repo] = form.repoUrl!.split('/');
    const profile = (thunkApi.getState() as RootState).profile.profile!;
    const githubToken = (thunkApi.getState() as RootState).session.accessToken || undefined;
    await thunkApi.dispatch(updateProfile({ data: {
      ...profile, dapp: {
        ...profile.dapp,
        name: form.name!,
        subject: form.subject,
        owner, repo, githubToken
      }
    }, profileId: payload || null }));
    await thunkApi.dispatch(clearAccessToken({}));
    const apiUrl = payload ? `/profile/${payload}/run`: '/run';
    const response = await fetch<string>(thunkApi, { method: 'POST', url: apiUrl, data: form.commitHash }, { useSession: true, useTextPlainClient: true });
    return response.data;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const fetchRunStatus = createAsyncThunk("fetchRunStatus", async (payload: {}, thunkApi) => {
  try {
    const { uuid, timelineConfig, plannedTestingTasks, unitTestSuccess, hasFailedTasks } = (thunkApi.getState() as RootState).testing;
    const response = await fetch<RunStatus>(thunkApi, { method: 'GET', url: `/run/${uuid}` });
    const newTimelineConfig = processTimeLineConfig(response, timelineConfig);
    const newPlannedTestingTasks = getPlannedTestingTasks(response, plannedTestingTasks);

    const status: string = response.data.status;
    const state: string | null = response.data.hasOwnProperty('state') && response.data.state ? response.data.state : null;
    
    let coverageFile = null;
    let resultData = null;
    let runEnded = false;
    let newUnitTestSuccess = unitTestSuccess;
    let newHasFailedTasks = hasFailedTasks;
    let fetching = status === 'certifying' || status === 'building' || status === 'preparing' || status === 'queued' || (status === 'finished' && state === 'running');
    let refetchMin = status === 'certifying' ? 2 : 5;

    if (status === 'finished') {
      const isArrayResult = Array.isArray(response.data.result);
      const resultJson = isArrayResult ? response.data.result[0] : response.data.result;
      if (isArrayResult) coverageFile = response.data.result[1];
      resultData = resultJson;
      runEnded = true;
      newUnitTestSuccess = processFinishedJson(resultJson);
      newHasFailedTasks = isAnyTaskFailure(resultData);
    }

    if (state === 'failed') {
      runEnded = true;
      fetching = false;
    }

    return {
      shouldFetchRunStatus: state === 'running' || state === 'passed',
      timelineConfig: newTimelineConfig,
      plannedTestingTasks: newPlannedTestingTasks,
      unitTestSuccess: newUnitTestSuccess,
      hasFailedTasks: newHasFailedTasks,
      runStatus: status,
      runState: state,
      coverageFile,
      resultData,
      runEnded,
      fetching,
      refetchMin,
    };
  } catch (e: any) {
    console.log(e);
    return thunkApi.rejectWithValue(e.response.data);
  }
});

export const testingSlice = createSlice({
  name: "testing",
  initialState,
  reducers: {
    resetForm: () => initialState,
    updateForm: (state, actions) => ({
      ...state,
      form: actions.payload
    }),
    resetDApp: (state) => ({
      ...initialState,
      resetForm: 'dapp'
    }),
    resetCommit: (state) => ({
      ...initialState,
      resetForm: 'commit'
    }),
    clearRun: (state) => ({
      ...state,
      runEnded: false,
      runState: null,
      runStatus: null,
      uuid: null,
      fetching: false,
      creating: false,
      shouldFetchRunStatus: false
    })
  },
  extraReducers: (builder) => {
    builder
      // CREATE TEST RUN
      .addCase(createTestRun.pending, (state) => {
        state.uuid = null;
        state.creating = true;
        state.resetForm = null;
      })
      .addCase(createTestRun.fulfilled, (state, actions) => {
        state.uuid = actions.payload;
        state.creating = false;
        state.timelineConfig = TIMELINE_CONFIG;
        state.plannedTestingTasks = [];
        state.coverageFile = null;
        state.resultData = null;
        state.runEnded = false;
        state.runStatus = null;
        state.runState = null;
        state.unitTestSuccess = true;
        state.hasFailedTasks = false;
        state.refetchMin = 5;
        state.shouldFetchRunStatus = false;
      })
      .addCase(createTestRun.rejected, (state) => {
        state.uuid = null;
        state.creating = false;
      })
      // FETCH RUN STATUS
      .addCase(fetchRunStatus.pending, (state) => {
        state.fetching = true;
      })
      .addCase(fetchRunStatus.fulfilled, (state, actions) => {
        state.fetching = actions.payload.fetching;
        state.timelineConfig = actions.payload.timelineConfig;
        state.plannedTestingTasks = actions.payload.plannedTestingTasks;
        state.coverageFile = actions.payload.coverageFile;
        state.resultData = actions.payload.resultData;
        state.runEnded = actions.payload.runEnded;
        state.runStatus = actions.payload.runStatus;
        state.runState = actions.payload.runState;
        state.unitTestSuccess = actions.payload.unitTestSuccess;
        state.hasFailedTasks = actions.payload.hasFailedTasks;
        state.refetchMin = actions.payload.refetchMin;
        state.shouldFetchRunStatus = actions.payload.shouldFetchRunStatus;
      })
      .addCase(fetchRunStatus.rejected, (state, actions) => {
        state.uuid = null;
        state.form = null;
      });
  },
});

export const { updateForm, resetForm, resetDApp, resetCommit, clearRun } = testingSlice.actions;

export default testingSlice.reducer;