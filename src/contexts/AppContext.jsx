import { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import useGamification from '../hooks/useGamification';
import useSubscription from '../hooks/useSubscription';
import { useAlertContext } from './AlertContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { showAlert } = useAlertContext();
  const { user, isAuthenticated } = useAuth();
  const gamification = useGamification();
  const subscription = useSubscription({ showAlert });

  const value = useMemo(
    () => ({ user, isAuthenticated, gamification, subscription }),
    [user, isAuthenticated, gamification, subscription]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}
