// components/LoginForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    identifier: '', // bisa email atau username
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.identifier, formData.password);
      
      // Redirect ke dashboard setelah login berhasil
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <Image
          src="/logo_marmud.png"
          alt="Logo Maritim Muda"
          width={120}
          height={40}
        />
      </div>

      {/* Title */}
      <h1 className="text-xl text-black font-semibold italic mb-2 text-center">
        Turbines
      </h1>
      <p className="text-black text-xs mb-6 text-center">
        Enter your credentials account to access internal tools,
        dashboards, and company services
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Email or Username */}
      <label className="text-xs font-semibold text-black">Email or Username</label>
      <input
        type="text"
        value={formData.identifier}
        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
        disabled={isLoading}
        required
        placeholder="Enter your email or username"
        className="w-full mt-1 mb-4 px-4 py-2 border border-blue-400 text-black rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Password */}
      <div>
        <label className="text-xs text-black font-semibold">Password</label>
        <div className="relative mt-1 mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={isLoading}
            required
            placeholder="Enter your password"
            className="w-full px-4 py-2 pr-10 border text-black border-blue-400 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>
      


      {/* Remember & Forgot */}
      <div className="flex justify-between items-center text-xs mb-6">
        <label className="flex items-center gap-2 text-black">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
            disabled={isLoading}
            className="border-2 border-blue-500 accent-blue-500 rounded-sm"
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-blue-500">
          Forgot password?
        </Link>
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-xl font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : 'Login'}
      </button>

      {/* Sign Up */}
      <p className="text-xs text-center text-black">
        Don't have account?{' '}
        <Link href="/signup" className="text-blue-500 font-medium">
          Sign Up
        </Link>
      </p>
    </form>
  );
}