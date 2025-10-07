/**
 * Authentication context for managing user authentication state in the React app.
 * Provides login, logout, and user state management using JWT tokens.
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// User interface for type safety
interface User {
  id: number;
  email: string;
  name: string;
}

// Auth context type definition
interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the app to provide authentication context.
 * Manages user state and token persistence in localStorage.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Effect to check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({ id: decoded.id, email: decoded.email, name: decoded.name });
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  /**
   * Logs in the user by storing the token and decoding user info.
   * @param token - JWT token from the server.
   */
  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decoded: any = jwtDecode(token);
    setUser({ id: decoded.id, email: decoded.email, name: decoded.name });
  };

  /**
   * Logs out the user by removing token and clearing user state.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the authentication context.
 * Must be used within an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
