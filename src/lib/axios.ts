import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Ambil access_token fresh dari cookie di setiap request (bukan dari default headers)
// Ini mencegah token stale tertempel setelah refresh
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Pastikan tidak ada Authorization header sisa jika token sudah hilang
      delete config.headers.Authorization;
    }
  }
  return config;
});

// ─── Refresh Token Logic ─────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Proses semua request yang tertunda setelah refresh selesai
function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

// Paksa logout: bersihkan semua cookie dan redirect
function forceLogout() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  Cookies.remove('user');
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

// ─── Response Interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Abaikan error non-401, atau jika tidak ada config (misal network error)
    if (!originalRequest) return Promise.reject(error);

    // Hindari infinite loop: jika request ini sudah diretry sekali, langsung reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Hindari refresh loop pada endpoint login/refresh itu sendiri
    const isAuthEndpoint =
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/refresh');
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Tandai request ini sudah diretry
    originalRequest._retry = true;

    // Jika sedang proses refresh, antrekan request yang gagal
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Ambil refresh token dari cookie
    const refreshToken = Cookies.get('refresh_token');

    if (!refreshToken) {
      // Jika token tidak ada dan ini error autentikasi (401), berulah redirect logout
      if (error.response?.status === 401) {
        forceLogout();
      }
      return Promise.reject(error);
    }

    isRefreshing = true;

    try {
      // Panggil endpoint refresh token menggunakan axios plain (bukan instance)
      // agar tidak terkena interceptor yang sama → mencegah loop
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
        { refresh_token: refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      const newAccessToken: string = data.data?.access_token ?? data.access_token;
      const newRefreshToken: string | undefined = data.data?.refresh_token ?? data.refresh_token;

      if (!newAccessToken) {
        // Response tidak mengandung token baru → paksa logout
        throw new Error('No access token in refresh response');
      }

      // Update cookies — pertahankan flag keamanan yang ada
      // expires: 1 hari untuk access_token (backend yang menentukan kapan benar-benar expired)
      Cookies.set('access_token', newAccessToken, { expires: 1 });
      if (newRefreshToken) {
        Cookies.set('refresh_token', newRefreshToken, { expires: 7 });
      }

      // Jangan simpan token di default headers (anti-pattern, bisa stuck dengan token lama)
      // Token selalu dibaca fresh dari cookie di request interceptor di atas

      // Retry original request dengan token baru
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Selesaikan semua request yang tertunda di antrian
      processQueue(null, newAccessToken);

      return axiosInstance(originalRequest);
    } catch (refreshError: any) {
      processQueue(refreshError, null);

      // Jangan paksa logout jika backend mati (Error 500+). 
      // Hanya logout otomatis jika Token Invalid/Expired (401/403).
      if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
        forceLogout();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
