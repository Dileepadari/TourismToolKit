'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../utils/types';
import { storage } from '../utils/helpers';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = storage.get('authToken');
        const storedUser = storage.get('authUser');

        if (storedToken && storedUser) {
          // Also ensure cookie is set for middleware
          document.cookie = `authToken=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
          
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        storage.remove('authToken');
        storage.remove('authUser');
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    try {
      // Store in localStorage
      storage.set('authToken', newToken);
      storage.set('authUser', JSON.stringify(newUser));
      
      // Also store token in cookies for middleware
      document.cookie = `authToken=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      
      // Update state
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    try {
      // Clear localStorage
      storage.remove('authToken');
      storage.remove('authUser');
      
      // Clear cookies
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      
      // Clear state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      storage.set('authUser', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}