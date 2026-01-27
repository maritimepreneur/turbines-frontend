// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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

// URL API - GANTI SESUAI API LU!
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check token saat pertama kali load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    const refresh = localStorage.getItem('refresh_token');

    if (token && savedUser) {
      setAccessToken(token);
      setRefreshToken(refresh);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Function Login
  const login = async (identifier: string, password: string) => {
    try {
      console.log('Attempting login to:', `${API_URL}/api/auth/login`);
      console.log('With credentials:', { identifier, password: '***' });

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      console.log('Response status:', response.status);

      const data: LoginResponse = await response.json();
      console.log('Response data:', data);

      // Cek kalo response success (cek data.code, bukan response.ok)
      if (data.code === 200 && data.data) {
        // Simpan token & user ke localStorage
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Set state
        setAccessToken(data.data.access_token);
        setRefreshToken(data.data.refresh_token);
        setUser(data.data.user);

        console.log('Login successful!');
      } else {
        // Kalo code bukan 200, throw error dengan pesan dari API
        // Ubah pesan bahasa Inggris jadi Indonesia
        const errorMessage = data.message === 'Invalid credentials' 
          ? 'Username atau password salah' 
          : data.message || 'Gagal login, silakan coba lagi';
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Throw error dengan message yang jelas
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Terjadi kesalahan saat login');
      }
    }
  };

  // Function Logout
  const logout = () => {
    // Hapus dari localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Reset state
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);

    // Redirect ke login
    router.push('/login');
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