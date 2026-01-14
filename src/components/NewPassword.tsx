"use client";

import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const isLengthValid = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  return (
    <div>
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Image
          src="/logo_marmud.png"
          alt="Logo Maritim Muda"
          width={120}
          height={40}
        />
      </div>

      {/* Title */}
      <h1 className="text-xl text-black font-semibold italic mb-2 text-center">
        Set a New Password
      </h1>
      <p className="text-gray-500 text-xs mb-6 text-center">
        Your new password must be different from previously used passwords
      </p>

      {/* Password Field */}
      <label className="text-xs font-semibold text-black">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mt-1 mb-4 px-4 py-2 border border-gray-300 rounded-xl text-black focus:outline-none focus:border-blue-400"
      />

      {/* Confirm Password Field */}
      <label className="text-xs font-semibold text-black">Confirm Password</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full mt-1 mb-1 px-4 py-2 border border-gray-300 rounded-xl text-black focus:outline-none focus:border-blue-400"
      />
      {confirmPassword !== "" && !passwordsMatch && (
        <p className="text-red-500 text-xs mb-4">Passwords do not match</p>
      )}
      {confirmPassword === "" && (
        <div className="mb-4"></div>
      )}
      {passwordsMatch && (
        <div className="mb-4"></div>
      )}

      {/* Password Requirements */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <FontAwesomeIcon 
            icon={isLengthValid ? faCheck : faXmark} 
            className={`w-3 h-3 ${isLengthValid ? 'text-green-500' : 'text-red-500'}`} 
          />
          <span>Must be at least 8 characters</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <FontAwesomeIcon 
            icon={hasSpecialChar ? faCheck : faXmark} 
            className={`w-3 h-3 ${hasSpecialChar ? 'text-green-500' : 'text-red-500'}`} 
          />
          <span>Must contain one special character</span>
        </div>
      </div>

      {/* Reset Button */}
      <Link href="/login" className="text-blue-500 font-medium">
        <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-medium mb-4">
          Reset Password
        </button>      
      </Link>
      
      {/* Back to Login */}
      <p className="text-xs text-center text-black flex items-center justify-center gap-2">
        <FontAwesomeIcon icon={faArrowLeftLong} className="w-4 h-4" />
        <Link href="/login" className="text-blue-500 font-medium">
          Back to Login
        </Link>
      </p>
    </div>
  );
}