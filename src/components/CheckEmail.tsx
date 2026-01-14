"use client";

import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, KeyboardEvent } from "react";

export default function CheckEmail() {
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split("");
    while (newCode.length < 4) newCode.push("");

    setCode(newCode);
    inputRefs.current[Math.min(pastedData.length, 3)]?.focus();
  };

  const handleSubmit = () => {
    const verificationCode = code.join("");
    if (verificationCode.length === 4) {
      console.log("Verification code:", verificationCode);
    } else {
      alert("Please enter the complete 4-digit code");
    }
  };

  const handleResend = () => {
    setCode(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center mb-6">
        <Image
          src="/logo_marmud.png"
          alt="Logo Maritim Muda"
          width={120}
          height={40}
        />
      </div>

      <h1 className="text-xl text-black font-semibold italic mb-2 text-center">
        Check Your Email
      </h1>
      <p className="text-gray-500 text-xs mb-8 text-center">
        Input the code that was sent to your email
      </p>

      <div className="flex justify-center gap-3 mb-8">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-12 text-center border border-gray-300 rounded-lg text-black text-lg focus:outline-none focus:border-blue-400"
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-medium mb-4"
      >
        Next
      </button>

      <p className="text-xs text-center text-black mb-4">
        Didn't get any code?{" "}
        <button onClick={handleResend} className="text-blue-500 font-medium underline">
          Click to resend code
        </button>
      </p>

      <p className="text-xs text-center text-black flex items-center justify-center gap-2">
        <FontAwesomeIcon icon={faArrowLeftLong} className="w-4 h-4" />
        <Link href="/login" className="text-blue-500 font-medium">
          Back to Login
        </Link>
      </p>
    </div>
  );
}