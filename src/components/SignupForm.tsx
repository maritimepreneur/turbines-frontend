import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

export default function SignupForm() {
  return (
    <div>
      {/* Logo */}
      <div className="flex justify-center">
        <Image
          src="/logo_marmud.png"
          alt="Logo Maritim Muda"
          width={120}
          height={40}
        />
      </div>

      {/* Title */}
      <h1 className="text-xl text-black font-semibold italic mb-2 text-center">
        SignUp
      </h1>

      <p className="text-black text-xs mb-6 text-center">
        Complete the form below to register
      </p>

      {/* Name */}
      <label className="text-xs font-semibold text-black">Name</label>
      <input
        type="email"
        className="w-full mt-1 mb-4 px-4 py-2 border border-blue-400 rounded-xl text-black  focus:outline-none"
      />
      {/* Email */}
      <label className="text-xs font-semibold text-black">Email Address</label>
      <input
        type="email"
        className="w-full mt-1 mb-4 px-4 py-2 border border-blue-400 rounded-xl text-black  focus:outline-none"
      />

      {/* Password */}
      <label className="text-xs text-black font-semibold">Password</label>
      <input
        type="password"
        className="w-full mt-1 mb-4 px-4 py-2 border border-blue-400 rounded-xl text-black focus:outline-none"
      />

      {/* Confirm Password */}
      <label className="text-xs text-black font-semibold">
        Confirm Password
      </label>
      <input
        type="password"
        className="w-full mt-1 mb-4 px-4 py-2 border border-blue-400 rounded-xl text-black focus:outline-none"
      />

      {/* Button */}
      <Link href="/login" className="text-blue-500 font-medium">
        <button className="w-full  bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-xl  font-medium mb-4">
          Register
        </button>        
      </Link>
      
      <p className="text-xs text-center text-black flex items-center justify-center gap-2">
        <FontAwesomeIcon icon={faArrowLeftLong} className="w-5 h-5" />
        <Link href="/login" className="text-blue-500 font-medium">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
