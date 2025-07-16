// store/persistedStore.ts
import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './accountSlice';
import tokenReducer from "./tokenSlice"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['account','tokens'], // which slice(s) to persist
};

const rootReducer = combineReducers({
  account: accountReducer,
  tokens : tokenReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
