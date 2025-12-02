import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DatingModeContextType {
  isDatingActive: boolean;
  setIsDatingActive: (active: boolean) => void;
}

const DatingModeContext = createContext<DatingModeContextType | undefined>(undefined);

export function DatingModeProvider({ children }: { children: ReactNode }) {
  const [isDatingActive, setIsDatingActive] = useState(false);

  return (
    <DatingModeContext.Provider value={{ isDatingActive, setIsDatingActive }}>
      {children}
    </DatingModeContext.Provider>
  );
}

export function useDatingMode() {
  const context = useContext(DatingModeContext);
  if (context === undefined) {
    throw new Error('useDatingMode must be used within a DatingModeProvider');
  }
  return context;
}
