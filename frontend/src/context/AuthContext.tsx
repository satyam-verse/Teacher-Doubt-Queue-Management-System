import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('doubtx_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('doubtx_token');
  });

  useEffect(() => {
    if (token && !user) {
      api.get('/api/v1/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('doubtx_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/v1/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('doubtx_token', newToken);
    localStorage.setItem('doubtx_user', JSON.stringify(newUser));
  };

  const register = async (email: string, password: string, fullName: string, role: Role) => {
    const res = await api.post('/api/v1/auth/register', {
      email,
      password,
      full_name: fullName,
      role
    });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('doubtx_token', newToken);
    localStorage.setItem('doubtx_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('doubtx_token');
    localStorage.removeItem('doubtx_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
