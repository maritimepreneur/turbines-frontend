// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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

  // Function Login menggunakan Axios
  const login = async (identifier: string, password: string) => {
    try {
      // console.log('🚀 Attempting login with axios...');
      // console.log('📧 Identifier:', identifier);

      // Gunakan axiosInstance dari lib/axios.ts
      const response = await axiosInstance.post<LoginResponse>('/api/auth/login', {
        identifier,
        password,
      });

      // console.log('📦 Response status:', response.status);
      // console.log('📊 Response data:', response.data);

      const data = response.data;

      // Cek kalo response success (cek data.code)
      if (data.code === 200 && data.data) {
        // console.log('✅ Login successful!');
        // console.log('👤 User:', data.data.user);
        // console.log('🔑 Token received');

        // Simpan token & user ke localStorage
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Set state
        setAccessToken(data.data.access_token);
        setRefreshToken(data.data.refresh_token);
        setUser(data.data.user);

        // console.log('💾 Data saved to localStorage');
      } else {
        // Kalo code bukan 200, throw error dengan pesan dari API
        // console.error('❌ Login failed with code:', data.code);
        
        const errorMessage = data.message === 'Invalid credentials' 
          ? 'Username atau password salah' 
          : data.message || 'Gagal login, silakan coba lagi';
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      // console.error('❌ Login error:', error);
      
      // Handle axios error
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('Server error:', status, data);
        
        if (status === 401) {
          throw new Error('Username atau password salah');
        } else if (status === 422) {
          throw new Error('Data yang dimasukkan tidak valid');
        } else if (data?.message) {
          // Translate common error messages
          const errorMessage = data.message === 'Invalid credentials' 
            ? 'Username atau password salah' 
            : data.message;
          throw new Error(errorMessage);
        } else {
          throw new Error('Gagal login, silakan coba lagi');
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response from server');
        throw new Error('Tidak dapat terhubung ke server');
      } else if (error.message) {
        // Error in setting up request or custom error
        throw error;
      } else {
        throw new Error('Terjadi kesalahan saat login');
      }
    }
  };

  // Function Logout menggunakan Axios
  const logout = async () => {
    try {
      // console.log('🚪 Logging out...');
      
      // Call logout API (optional - jika backend punya endpoint logout)
      // await axiosInstance.post('/api/auth/logout');
      
    } catch (error) {
      console.error('Logout API error:', error);
      // Tetap lanjut logout walaupun API error
    } finally {
      // Hapus dari localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      // Reset state
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);

      // console.log('✅ Logged out successfully');

      // Redirect ke login
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