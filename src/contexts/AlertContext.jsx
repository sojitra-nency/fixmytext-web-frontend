import { createContext, useContext } from 'react';
import { useAlert } from '../hooks/useAlert';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const alertState = useAlert();

  return <AlertContext.Provider value={alertState}>{children}</AlertContext.Provider>;
}

export function useAlertContext() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return ctx;
}
