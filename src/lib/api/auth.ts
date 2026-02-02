// // lib/api/auth.ts
// // Service untuk handle API authentication

// import { apiClient, ApiError } from './client';

// interface LoginCredentials {
//   identifier: string; // bisa email atau username
//   password: string;
// }

// interface LoginResponse {
//   success: boolean;
//   token?: string;
//   user?: {
//     id: string;
//     email: string;
//     name: string;
//     username?: string;
//   };
//   message?: string;
// }

// export const authService = {
//   async login(identifier: string, password: string): Promise<LoginResponse> {
//     try {
//       // Kirim sebagai identifier, biarkan backend yang handle
//       const data = await apiClient<LoginResponse>('/api/auth/login', {
//         method: 'POST',
//         body: JSON.stringify({ 
//           identifier,
//           password 
//         }),
//       });

//       // Simpan token ke localStorage jika ada
//       if (data.token) {
//         localStorage.setItem('token', data.token);
        
//         // Simpan user data jika ada
//         if (data.user) {
//           localStorage.setItem('user', JSON.stringify(data.user));
//         }
//       }

//       return data;
//     } catch (error) {
//       console.error('Login error:', error);
      
//       if (error instanceof ApiError) {
//         throw new Error(error.message);
//       }
      
//       throw new Error('Terjadi kesalahan saat login');
//     }
//   },

//   logout() {
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//     }
//   },

//   getToken(): string | null {
//     if (typeof window === 'undefined') return null;
//     return localStorage.getItem('token');
//   },

//   getUser(): { id: string; email: string; name: string; username?: string } | null {
//     if (typeof window === 'undefined') return null;
//     const user = localStorage.getItem('user');
//     return user ? JSON.parse(user) : null;
//   },

//   isAuthenticated(): boolean {
//     return !!this.getToken();
//   }
// };