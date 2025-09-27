import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  // Add any global app state here
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Add any global app state logic here
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
