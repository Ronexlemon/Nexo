import { useDispatch, useSelector } from 'react-redux';

import {
  createAccount,
  logIn,
  logOut,
  setMnemonic,
  clearMnemonic,
  setPin,
  clearPin,
} from "../store/accountSlice";
import { RootState } from '../store/redux';

export const useAccount = () => {
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.account);

  
  const create = (payload: {
    mnemonic: string;
    publicAddress: string;
    name: string;
    pin?: string;
  }) => dispatch(createAccount(payload));

  const login = (payload: { name: string; publicAddress: string }) =>
    dispatch(logIn(payload));

  const logout = () => dispatch(logOut());

  const setAccountMnemonic = (mnemonic: string) => dispatch(setMnemonic(mnemonic));
  const wipeMnemonic = () => dispatch(clearMnemonic());

  const setAccountPin = (pin: string) => dispatch(setPin(pin));
  const wipePin = () => dispatch(clearPin());

  return {
    account,
    create,
    login,
    logout,
    setAccountMnemonic,
    wipeMnemonic,
    setAccountPin,
    wipePin,
  };
};
