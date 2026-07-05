import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthContextType {
  user: Omit<User, 'passwordHash'> | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hba_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser(token);
          if (currentUser) {
            setUser(currentUser);
          } else {
            localStorage.removeItem('hba_token');
            setToken(null);
          }
        } catch {
          localStorage.removeItem('hba_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('hba_token', response.token);
      setToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    setIsLoading(true);
    try {
      const response = await authService.register({ name, email, password });
      localStorage.setItem('hba_token', response.token);
      setToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('hba_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) => {
    if (!user) throw new Error('Not authenticated');
    const updatedUser = await authService.updateProfile(user.id, updates);
    setUser(updatedUser);
  }, [user]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      login,
      register,
      logout,
      isLoading,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
