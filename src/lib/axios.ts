// lib/axios.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://turbines-murex.vercel.app',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    
    // Add auth token if exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token attached to request');
      }
    }

    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // console.error('❌ Response error:', error.response?.status, error.message);

    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          console.log('🔄 Attempting token refresh...');
          
          // Try to refresh token
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
            { refresh_token: refreshToken }
          );

          if (response.data.code === 200 && response.data.data?.access_token) {
            const newAccessToken = response.data.data.access_token;
            
            console.log('✅ Token refreshed successfully');
            
            // Save new token
            localStorage.setItem('access_token', newAccessToken);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Redirect to login only if not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error('🚫 Forbidden: You do not have permission');
    }

    if (error.response?.status === 404) {
      console.error('🔍 Not Found: Resource does not exist');
    }

    // if (error.response?.status >= 500) {
    //   console.error('🔥 Server Error: Please try again later');
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;