import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, User } from '../lib/api';
import { clearAllCache } from '../lib/queryClient';
import { clearUserEmoji } from './EmojiContext';

// Token expiration utilities
const TOKEN_EXPIRATION_KEY = 'auth_token_expires';
const DAY_IN_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const WEEK_IN_MS = 7 * DAY_IN_MS; // 1 week in milliseconds

const setTokenWithExpiration = (token: string, user: User, rememberMe: boolean) => {
  const expirationTime = Date.now() + (rememberMe ? WEEK_IN_MS : DAY_IN_MS);
  
  // Always use localStorage for persistence, but with different expiration times
  // 1 day for normal login, 1 week for "Remember Me"
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem(TOKEN_EXPIRATION_KEY, expirationTime.toString());
  
  // Clear sessionStorage to avoid conflicts
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem(TOKEN_EXPIRATION_KEY);
};

const isTokenExpired = (): boolean => {
  const localExpiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);
  const sessionExpiration = sessionStorage.getItem(TOKEN_EXPIRATION_KEY);
  
  const expiration = localExpiration || sessionExpiration;
  
  // If no expiration timestamp, consider it expired (legacy tokens)
  if (!expiration) return true;
  
  return Date.now() > parseInt(expiration, 10);
};

const clearAllTokenData = () => {
  // Clear localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  localStorage.removeItem(TOKEN_EXPIRATION_KEY);
  
  // Clear sessionStorage
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem(TOKEN_EXPIRATION_KEY);
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      // Check localStorage first (remember me), then sessionStorage
      let storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      let storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      // If no stored credentials, nothing to load
      if (!storedToken || !storedUser) {
        console.log('🔒 No stored credentials found');
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired()) {
        console.log('🕒 Token expired, clearing storage');
        clearAllTokenData();
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // Token exists and is valid, load the user
      try {
        console.log('🔑 Loading stored user session');
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid by fetching user data
        const currentUser = await authAPI.getUser();
        setUser(currentUser);
        
        // Always update localStorage with latest user data (since we now always use localStorage)
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (error) {
        console.error('Failed to verify token:', error);
        // Token invalid, clear all storage
        clearAllTokenData();
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Check token expiration periodically (every minute)
  useEffect(() => {
    if (!token || !user) return;

    const checkTokenExpiration = () => {
      if (isTokenExpired()) {
        console.log('🔒 Token expired, logging out automatically');
        logout();
      }
    };

    // Check immediately and then every minute
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [token, user]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      
      console.log('✅ Login successful, setting token and user:', response.user.name);
      setToken(response.token);
      setUser(response.user);
      
      // Set token with appropriate expiration (1 day or 1 week)
      setTokenWithExpiration(response.token, response.user, rememberMe);
      
      // Dispatch user changed event for other contexts
      window.dispatchEvent(new Event('userChanged'));
      
      const expirationTime = rememberMe ? '1 week' : '1 day';
      console.log(`💾 Token saved with ${expirationTime} expiration (Remember Me: ${rememberMe})`);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await authAPI.register({ name, email, password, password_confirmation });
      
      setToken(response.token);
      setUser(response.user);
      
      // Set token with default 1 day expiration for new registrations
      setTokenWithExpiration(response.token, response.user, false);
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear user-specific emoji before clearing user from storage
      clearUserEmoji();
      
      // Clear all React Query cache to prevent data leakage between users
      clearAllCache();
      
      // Clear all token data and state
      clearAllTokenData();
      setToken(null);
      setUser(null);
      
      // Dispatch user changed event for other contexts
      window.dispatchEvent(new Event('userChanged'));
      
      // Also remove old shared emoji key if exists
      localStorage.removeItem('userEmoji');
      
      // Clear read notifications
      localStorage.removeItem('readNotifications');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
