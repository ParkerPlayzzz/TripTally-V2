import React, { createContext, useContext } from 'react';

type AuthContextType = {
  user: { id?: string; name?: string } | null;
  login: (...args: any[]) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value: AuthContextType = { user: null, login: async () => {}, logout: () => {} };
  // Avoid JSX to satisfy compilers without --jsx flag
  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, login: async () => {}, logout: () => {} };
  return ctx;
};

export default AuthContext;