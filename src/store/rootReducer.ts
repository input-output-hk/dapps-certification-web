import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./slices/auth.slice";
import certificationReducer from "pages/certification/slices/certification.slice";
import deleteTestHistory from "pages/testHistory/slices/deleteTestHistory.slice";
import logRunTimeSlice from "pages/certification/slices/logRunTime.slice";
import walletTransactionSlice from "./slices/walletTransaction.slice";
import repoAccessSlice from "pages/userProfile/slices/repositoryAccess.slice";
import priceSlice from "pages/landing/slices/price.slice";
import tiersSlice from "pages/landing/slices/tiers.slice";
import sessionSlice from "./slices/session.slice";
import registrationSlice from "pages/landing/slices/registration.slice";

const rootReducer = combineReducers({
  auth: authReducer,
  certification: certificationReducer,
  deleteTestHistory,
  runTime: logRunTimeSlice,
  walletTransaction: walletTransactionSlice,
  repoAccess: repoAccessSlice,
  price: priceSlice,
  tiers: tiersSlice,
  session: sessionSlice,
  registration: registrationSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;