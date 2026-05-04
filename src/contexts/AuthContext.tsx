// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

// ─── Cookie Options ─────────────────────────────────────────────────────────
// Gunakan Secure hanya di production (HTTPS), selalu pakai SameSite=Strict
const isProduction = process.env.NODE_ENV === 'production';

function cookieOptions(expireDays: number): Cookies.CookieAttributes {
  return {
    expires: expireDays,
    sameSite: 'Strict',
    secure: isProduction,
    // path default '/' sudah benar
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ─── Fungsi untuk membersihkan semua sesi ──────────────────────────────────
  const clearSession = useCallback(() => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  // ─── Sinkronisasi state dari Cookie saat pertama kali load ─────────────────
  useEffect(() => {
    const token = Cookies.get('access_token');
    const savedUser = Cookies.get('user');
    const refresh = Cookies.get('refresh_token');

    if (token && savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        // Validasi minimal: pastikan user memiliki field yang diharapkan
        if (!parsedUser.id || !parsedUser.username) {
          throw new Error('Invalid user data structure');
        }
        setAccessToken(token);
        setRefreshToken(refresh || null);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data from cookie:', error);
        clearSession();
      }
    }
    setIsLoading(false);
  }, [clearSession]);

  // ─── Sinkronisasi state jika token di cookie berubah (oleh axios interceptor) ─
  // Berguna agar state React tetap sinkron setelah refresh token otomatis di background
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncTokenFromCookie = () => {
      const latestToken = Cookies.get('access_token');
      const latestRefresh = Cookies.get('refresh_token');

      if (latestToken && latestToken !== accessToken) {
        setAccessToken(latestToken);
      }
      if (latestRefresh && latestRefresh !== refreshToken) {
        setRefreshToken(latestRefresh);
      }

      // Jika token hilang dari cookie (logout paksa dari interceptor)
      if (!latestToken && accessToken) {
        clearSession();
        router.push('/login');
      }
    };

    // Sync saat tab/window mendapat fokus kembali
    window.addEventListener('focus', syncTokenFromCookie);
    return () => window.removeEventListener('focus', syncTokenFromCookie);
  }, [accessToken, refreshToken, clearSession, router]);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = async (identifier: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await axiosInstance.post<LoginResponse>('/api/auth/login', {
        identifier,
        password,
      });

      const data = response.data;

      if (data.code === 200 && data.data) {
        // Remember Me: access 7 hari, refresh 30 hari
        // Tidak remember: access 1 hari, refresh 7 hari
        const accessExpireDays = rememberMe ? 7 : 1;
        const refreshExpireDays = rememberMe ? 30 : 7;

        // Simpan ke Cookies dengan atribut keamanan
        Cookies.set('access_token', data.data.access_token, cookieOptions(accessExpireDays));
        Cookies.set('refresh_token', data.data.refresh_token, cookieOptions(refreshExpireDays));
        // Cookie user disimpan tanpa Secure karena diakses untuk display data saja
        Cookies.set('user', JSON.stringify(data.data.user), { expires: accessExpireDays, sameSite: 'Strict' });

        // Set state
        setAccessToken(data.data.access_token);
        setRefreshToken(data.data.refresh_token);
        setUser(data.data.user);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error: any) {
      // Jangan expose detail error internal ke user (keamanan)
      const status = error.response?.status;
      const msg: string = error.response?.data?.message ?? error.message ?? 'Login failed';

      if (
        status === 401 ||
        status === 403 ||
        msg.toLowerCase().includes('password') ||
        msg.toLowerCase().includes('username') ||
        msg.toLowerCase().includes('credential') ||
        msg.toLowerCase().includes('not found') ||
        msg.toLowerCase().includes('invalid')
      ) {
        throw new Error('Invalid email or password');
      }

      // Error server atau network
      if (status >= 500) {
        throw new Error('Server error, please try again later');
      }

      throw new Error('Login failed. Please try again');
    }
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      // Panggil endpoint logout ke backend untuk invalidate token di server
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      // Tetap lanjut logout meski API gagal
      console.warn('Logout API call failed (non-critical):', error);
    } finally {
      clearSession();
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