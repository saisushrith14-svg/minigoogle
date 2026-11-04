import React, { ReactNode } from 'react';
import { AppProvider } from '../state/AppContext';

export interface ProvidersProps {
  readonly children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <AppProvider>{children}</AppProvider>;
};

