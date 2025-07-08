import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AccountState {
  isAccountCreated: boolean;
  mnemonic: string | null;
  hasMnemonic: boolean;
  publicAddress: string | null;
  isLoggedIn: boolean;
  name: string;
  pin: string | null; // plain or hashed depending on your choice
  hasPin: boolean;
}

const initialState: AccountState = {
  isAccountCreated: false,
  mnemonic: null,
  hasMnemonic: false,
  publicAddress: null,
  isLoggedIn: false,
  name: '',
  pin: null,
  hasPin: false,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    createAccount(
      state,
      action: PayloadAction<{
        mnemonic: string;
        publicAddress: string;
        name: string;
        pin?: string;
      }>
    ) {
      state.mnemonic = action.payload.mnemonic;
      state.publicAddress = action.payload.publicAddress;
      state.name = action.payload.name;
      state.hasMnemonic = true;
      state.isAccountCreated = true;
      state.isLoggedIn = true;

      if (action.payload.pin) {
        state.pin = action.payload.pin;
        state.hasPin = true;
      }
    },
    setPin(state, action: PayloadAction<string>) {
      state.pin = action.payload;
      state.hasPin = true;
    },
    clearPin(state) {
      state.pin = null;
      state.hasPin = false;
    },
    logIn(state, action: PayloadAction<{ name: string; publicAddress: string }>) {
      state.name = action.payload.name;
      state.publicAddress = action.payload.publicAddress;
      state.isLoggedIn = true;
    },
    logOut(state) {
      state.isLoggedIn = false;
      state.name = '';
      state.publicAddress = null;
      // Optional: clear pin and mnemonic for better security
      // state.pin = null;
      // state.hasPin = false;
      // state.mnemonic = null;
      // state.hasMnemonic = false;
    },
    setMnemonic(state, action: PayloadAction<string>) {
      state.mnemonic = action.payload;
      state.hasMnemonic = true;
    },
    clearMnemonic(state) {
      state.mnemonic = null;
      state.hasMnemonic = false;
    },
  },
});

export const {
  createAccount,
  logIn,
  logOut,
  setMnemonic,
  clearMnemonic,
  setPin,
  clearPin,
} = accountSlice.actions;
export default accountSlice.reducer;
