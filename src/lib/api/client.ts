// // lib/api/client.ts
// // Base API client dengan error handling

// export class ApiError extends Error {
//   constructor(
//     public status: number,
//     public message: string,
//     public data?: unknown
//   ) {
//     super(message);
//     this.name = 'ApiError';
//   }
// }

// export async function apiClient<T>(
//   endpoint: string,
//   options?: RequestInit
// ): Promise<T> {
//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
//   if (!baseUrl) {
//     throw new Error('NEXT_PUBLIC_API_URL is not defined');
//   }

//   const url = `${baseUrl}${endpoint}`;
  
//   const config: RequestInit = {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...options?.headers,
//     },
//   };

//   // Tambahkan token jika ada (untuk SSR check window)
//   if (typeof window !== 'undefined') {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers = {
//         ...config.headers,
//         Authorization: `Bearer ${token}`,
//       };
//     }
//   }

//   try {
//     const response = await fetch(url, config);
//     const data = await response.json();

//     if (!response.ok) {
//       throw new ApiError(
//         response.status,
//         data.message || `HTTP error! status: ${response.status}`,
//         data
//       );
//     }

//     return data;
//   } catch (error) {
//     if (error instanceof ApiError) {
//       throw error;
//     }
    
//     // Network error atau error lainnya
//     throw new ApiError(
//       0,
//       error instanceof Error ? error.message : 'Network error occurred'
//     );
//   }
// }