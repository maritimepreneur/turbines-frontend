// components/SignUpForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from "lucide-react";
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://turbines-murex.vercel.app';

export default function SignUpForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'USER', // default role
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validasi password match
    if (formData.password !== formData.confirm_password) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    // Validasi password minimal 6 karakter
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: formData.role,
      });

      // Cek response success
      if (response.data.code === 201 || response.data.code === 200) {
        // Sign up berhasil, redirect ke login
        router.push('/login?registered=true');
      } else {
        // Error dari API
        throw new Error(response.data.message || 'Registrasi gagal');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle axios error
        setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat registrasi');
      } else {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat registrasi');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <Image
          src="/turbines_logo.jpeg"
          alt="Logo Maritim Muda"
          width={120}
          height={40}
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>

      {/* Title */}
      <h1 className="text-xl text-black font-semibold italic mb-2 text-center">
        Create Account
      </h1>
      <p className="text-black text-xs mb-6 text-center">
        Sign up to get started with Turbines
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Username */}
      <label className="text-xs font-semibold text-black">Username</label>
      <input
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        disabled={isLoading}
        required
        placeholder="Enter your username"
        className="w-full mt-1 mb-4 px-4 py-2 border border-blue-400 text-black rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Email */}
      <label className="text-xs font-semibold text-black">Email</label>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={isLoading}
        required
        placeholder="Enter your email"
        className="w-full mt-1 mb-4 px-4 py-2 border border-blue-400 text-black rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Password */}
      <div>
        <label className="text-xs text-black font-semibold">
          Password
        </label>
        <div className="relative mt-1 mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
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

      {/* Confirm Password */}
      <div>
        <label className="text-xs text-black font-semibold">
          Confirm Password
        </label>

        <div className="relative mt-1 mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirm_password}
            onChange={(e) =>
              setFormData({ ...formData, confirm_password: e.target.value })
            }
            disabled={isLoading}
            required
            placeholder="Confirm your password"
            className="w-full px-4 py-2 pr-10 border text-black border-blue-400 rounded-xl focus:outline-none disabled:opacity-50"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-3 inset-y-0 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? (
              <Eye size={18} />
            ) : (
              <EyeOff size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-xl font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </button>

      {/* Login Link */}
      <p className="text-xs text-center text-black">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-500 font-medium">
          Login
        </Link>
      </p>
    </form>
  );
}