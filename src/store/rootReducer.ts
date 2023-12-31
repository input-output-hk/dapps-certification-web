import { combineReducers, Reducer, AnyAction } from "@reduxjs/toolkit";

import authSlice from "./slices/auth.slice";
import sessionSlice from "./slices/session.slice";
import registerSlice from "./slices/register.slice";
import profileSlice from "./slices/profile.slice";
import walletConnectionSlice from "./slices/walletConnection.slice";
import walletTransactionSlice from "./slices/walletTransaction.slice";
import testingHistorySlice from "./slices/testingHistory.slice";
import logRunTimeSlice from "./slices/logRunTime.slice";
import priceSlice from "./slices/price.slice";
import tiersSlice from "./slices/tiers.slice";
import repositoryAccessSlice from "./slices/repositoryAccess.slice";
import reportUploadSlice from "./slices/reportUpload.slice";
import certificateSlice from "./slices/certificate.slice";
import testingSlice from "./slices/testing.slice";
import certificationResultSlice from "./slices/certificationResult.slice";
import metricsSlice from "./slices/metrics.slice";
import snackbarSlice from "./slices/snackbar.slice";

const combinedReducer = combineReducers({
  auth: authSlice,
  session: sessionSlice,
  register: registerSlice,
  profile: profileSlice,
  walletConnection: walletConnectionSlice,
  walletTransaction: walletTransactionSlice,
  testingHistory: testingHistorySlice,
  runTime: logRunTimeSlice,
  price: priceSlice,
  tiers: tiersSlice,
  repositoryAccess: repositoryAccessSlice,
  reportUpload: reportUploadSlice,
  certificate: certificateSlice,
  testing: testingSlice,
  certificationResult: certificationResultSlice,
  metrics: metricsSlice,
  snackbar: snackbarSlice,
});

const rootReducer: Reducer = (state: RootState, action: AnyAction) => {
  if (action.type === 'auth/logout') state = {} as RootState;
  return combinedReducer(state, action);
}

export type RootState = ReturnType<typeof combinedReducer>;

export default rootReducer;