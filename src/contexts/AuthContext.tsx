// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import Cookies from 'js-cookie';
// Interface untuk User
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  partner_id: number;
  created_at: string;
}

// Interface untuk Auth Context
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Interface untuk Login Response
interface LoginResponse {
  code: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check token saat pertama kali load
  useEffect(() => {
    const token = Cookies.get('access_token');
    const savedUser = Cookies.get('user');
    const refresh = Cookies.get('refresh_token');

    if (token && savedUser) {
      setAccessToken(token);
      setRefreshToken(refresh || null);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await axiosInstance.post<LoginResponse>('/api/auth/login', {
        identifier,
        password,
      });

      const data = response.data;

      if (data.code === 200 && data.data) {
        // Simpan ke cookies (expires dalam 7 hari)
        Cookies.set('access_token', data.data.access_token, { expires: 7 });
        Cookies.set('refresh_token', data.data.refresh_token, { expires: 7 });
        Cookies.set('user', JSON.stringify(data.data.user), { expires: 7 });

        // Set state
        setAccessToken(data.data.access_token);
        setRefreshToken(data.data.refresh_token);
        setUser(data.data.user);
      } else {
        const errorMessage = data.message === 'Invalid credentials'
          ? 'Username atau password salah'
          : data.message || 'Gagal login, silakan coba lagi';

        throw new Error(errorMessage);
      }
    } catch (error: any) {
      // ... error handling tetap sama ...
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Optional: call logout API
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Hapus dari cookies
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');

      // Reset state
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);

      router.push('/login');
    }
  };

  const isAuthenticated = !!accessToken && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook untuk menggunakan Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}