// import axiosInstance from '@/lib/axios';
// import { ApiResponse, PaginatedResponse } from '@/types/api';

// // Generic API Service
// export const apiService = {
//   // GET request
//   get: async <T>(url: string, params?: any) => {
//     const response = await axiosInstance.get<ApiResponse<T>>(url, { params });
//     return response.data;
//   },

//   // GET with pagination
//   getPaginated: async <T>(url: string, params?: any) => {
//     const response = await axiosInstance.get<PaginatedResponse<T>>(url, { params });
//     return response.data;
//   },

//   // POST request
//   post: async <T>(url: string, data?: any) => {
//     const response = await axiosInstance.post<ApiResponse<T>>(url, data);
//     return response.data;
//   },

//   // PUT request
//   put: async <T>(url: string, data?: any) => {
//     const response = await axiosInstance.put<ApiResponse<T>>(url, data);
//     return response.data;
//   },

//   // PATCH request
//   patch: async <T>(url: string, data?: any) => {
//     const response = await axiosInstance.patch<ApiResponse<T>>(url, data);
//     return response.data;
//   },

//   // DELETE request
//   delete: async <T>(url: string) => {
//     const response = await axiosInstance.delete<ApiResponse<T>>(url);
//     return response.data;
//   },

//   // POST with FormData (untuk upload file)
//   postFormData: async <T>(url: string, formData: FormData) => {
//     const response = await axiosInstance.post<ApiResponse<T>>(url, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },
// };

// // Contoh: Specific Service untuk endpoint tertentu
// export const userService = {
//   getAll: (params?: any) => apiService.getPaginated('/users', params),
//   getById: (id: number) => apiService.get(`/users/${id}`),
//   create: (data: any) => apiService.post('/users', data),
//   update: (id: number, data: any) => apiService.put(`/users/${id}`, data),
//   delete: (id: number) => apiService.delete(`/users/${id}`),
// };

// // Auth Service
// export const authService = {
//   login: (credentials: { email: string; password: string }) =>
//     apiService.post('/api/auth/login', credentials),
//   register: (data: any) => apiService.post('/api/auth/register', data),
//   logout: () => apiService.post('/api/auth/logout'),
//   getCurrentUser: () => apiService.get('/api/auth/me'),
//   refreshToken: (refreshToken: string) =>
//     apiService.post('/auth/refresh', { refresh_token: refreshToken }),
// };