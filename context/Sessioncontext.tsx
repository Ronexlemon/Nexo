
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserPin } from '../utills/storage';

type SessionContextType = {
  isAuthenticated: boolean;
  authenticate: () => void;
  logout: () => void;
  resetInactivityTimer: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation<any>();
  const timer = useRef<NodeJS.Timeout | null>(null);
  const timeout = 10 * 60 * 1000; // 10 minutes

  const resetInactivityTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      logout();
    }, timeout);
  };

  const authenticate = () => {
    setIsAuthenticated(true);
    resetInactivityTimer();
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (timer.current) clearTimeout(timer.current);
    navigation.reset({
      index: 0,
      routes: [{ name: 'AuthScreen' }],
    });
  };

  // Reset timer on app resume
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        resetInactivityTimer();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ isAuthenticated, authenticate, logout, resetInactivityTimer }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
