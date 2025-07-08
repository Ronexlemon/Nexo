import { configureStore } from '@reduxjs/toolkit';
import accountReducer from "./accountSlice"; // example slice

const store = configureStore({
  reducer: {
    account: accountReducer,
    // Add more slices here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
