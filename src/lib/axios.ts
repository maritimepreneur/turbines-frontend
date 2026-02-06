// lib/axios.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { logger } from './logger';

const axiosInstance = axios.create({
  baseURL: 'https://turbines-murex.vercel.app',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    logger.request(config.method || 'GET', config.url || '');

    // Add auth token if exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    logger.error('Request error', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    logger.response(response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          logger.info('Attempting token refresh...');

          // Try to refresh token
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
            { refresh_token: refreshToken }
          );

          if (response.data.code === 200 && response.data.data?.access_token) {
            const newAccessToken = response.data.data.access_token;

            logger.success('Token refreshed successfully');

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
        logger.error('Token refresh failed', refreshError);

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
      logger.error('Forbidden: You do not have permission');
    }

    if (error.response?.status === 404) {
      logger.error('Not Found: Resource does not exist');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;