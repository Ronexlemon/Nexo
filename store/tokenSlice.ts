import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: string; // string to avoid precision loss (can use BigNumber in advanced cases)
}

interface TokenState {
  tokens: TokenBalance[];
}

const initialState: TokenState = {
  tokens: [],
};

const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<TokenBalance[]>) {
      state.tokens = action.payload;
    },
    addToken(state, action: PayloadAction<TokenBalance>) {
      const existing = state.tokens.find(
        (token) => token.address.toLowerCase() === action.payload.address.toLowerCase()
      );
      if (!existing) {
        state.tokens.push(action.payload);
      }
    },
    updateTokenBalance(
      state,
      action: PayloadAction<{ address: string; balance: string }>
    ) {
      const token = state.tokens.find(
        (t) => t.address.toLowerCase() === action.payload.address.toLowerCase()
      );
      if (token) {
        token.balance = action.payload.balance;
      }
    },
    clearTokens(state) {
      state.tokens = [];
    },
  },
});

export const { setTokens, addToken, updateTokenBalance, clearTokens } = tokenSlice.actions;
export default tokenSlice.reducer;
