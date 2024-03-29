import { Action, configureStore } from "@reduxjs/toolkit";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import { ThunkAction } from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import rootReducer, { RootState } from "./rootReducer";

const persistConfig = {
  key: 'root',
  storage: require('redux-persist-indexeddb-storage').default('redux'),
  whitelist: ['session', 'profile', 'walletConnection', 'testing'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;

export const useAppDispatch = () => useDispatch();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const persistor = persistStore(store);

export default store;