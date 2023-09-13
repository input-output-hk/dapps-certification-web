import { combineReducers } from "@reduxjs/toolkit";

import authSlice from "./slices/auth.slice";
import registerSlice from "./slices/register.slice";
import walletTransactionSlice from "./slices/walletTransaction.slice";
import certificationReducer from "pages/certification/slices/certification.slice";
import deleteTestHistory from "pages/testHistory/slices/deleteTestHistory.slice";
import logRunTimeSlice from "pages/certification/slices/logRunTime.slice";
import priceSlice from "pages/landing/slices/price.slice";
import tiersSlice from "pages/landing/slices/tiers.slice";

const rootReducer = combineReducers({
  auth: authSlice,
  register: registerSlice,
  walletTransaction: walletTransactionSlice,
  certification: certificationReducer,
  deleteTestHistory,
  runTime: logRunTimeSlice,
  price: priceSlice,
  tiers: tiersSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;