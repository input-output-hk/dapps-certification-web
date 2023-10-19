import { combineReducers } from "@reduxjs/toolkit";

import authSlice from "./slices/auth.slice";
import sessionSlice from "./slices/session.slice";
import registerSlice from "./slices/register.slice";
import profileSlice from "./slices/profile.slice";
import walletConnectionSlice from "./slices/walletConnection.slice";
import walletTransactionSlice from "./slices/walletTransaction.slice";
import certificationReducer from "pages/certification/slices/certification.slice";
import deleteTestHistorySlice from "pages/testingHistory/slices/deleteTestHistory.slice";
import logRunTimeSlice from "pages/certification/slices/logRunTime.slice";
import priceSlice from "pages/landing/slices/price.slice";
import tiersSlice from "pages/landing/slices/tiers.slice";
import repositoryAccessSlice from "./slices/repositoryAccess.slice";
import reportUploadSlice from "./slices/reportUpload.slice";

const rootReducer = combineReducers({
  auth: authSlice,
  session: sessionSlice,
  register: registerSlice,
  profile: profileSlice,
  walletConnection: walletConnectionSlice,
  walletTransaction: walletTransactionSlice,
  certification: certificationReducer,
  deleteTestHistory: deleteTestHistorySlice,
  runTime: logRunTimeSlice,
  price: priceSlice,
  tiers: tiersSlice,
  repoAccess: repositoryAccessSlice,
  reportUpload: reportUploadSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;