import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../lib/supabase';
import { apiGetMe, apiLogout } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { user: fetchedUser } = await apiGetMe();
    setUser(fetchedUser);
  }, []);

  useEffect(() => {
    // Check session on app mount
    (async () => {
      const { user: fetchedUser } = await apiGetMe();
      setUser(fetchedUser);
      setLoading(false);
    })();
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
