// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axiosInstance from '@/lib/axios';

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
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
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

  // Check token saat pertama kali load dari Cookies
  useEffect(() => {
    // Cookies aman dipanggil di client side
    const token = Cookies.get('access_token');
    const savedUser = Cookies.get('user');
    const refresh = Cookies.get('refresh_token');

    if (token && savedUser) {
      try {
        setAccessToken(token);
        setRefreshToken(refresh || null);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear corrupted data
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await axiosInstance.post<LoginResponse>('/api/auth/login', {
        identifier,
        password,
      });

      const data = response.data;

      if (data.code === 200 && data.data) {
        // Tentukan waktu kadaluarsa berdasarkan Remember Me
        // Jika Remember Me: 7 hari
        // Jika Tidak: 1 hari
        const expirationSeconds = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
        const expiresAt = new Date(new Date().getTime() + expirationSeconds * 1000);

        // Simpan ke Cookies
        Cookies.set('access_token', data.data.access_token, { expires: expiresAt });
        Cookies.set('refresh_token', data.data.refresh_token, { expires: expiresAt });
        Cookies.set('user', JSON.stringify(data.data.user), { expires: expiresAt });

        // Set state
        setAccessToken(data.data.access_token);
        setRefreshToken(data.data.refresh_token);
        setUser(data.data.user);
      } else {
        // Custom error message in English
        const errorMessage = 'Invalid email or password';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      // Standardize error message to English
      const msg = error.response?.data?.message || error.message || 'Login failed';
      // If error is related to credentials, use standard English message
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('username') || msg.toLowerCase().includes('credentials') || msg.toLowerCase().includes('credential') || error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(msg); // Throw original message for other errors (like server error)
    }
  };

  const logout = async () => {
    try {
      // Optional: call logout API
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Hapus dari Cookies
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