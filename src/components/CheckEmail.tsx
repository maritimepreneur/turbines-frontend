import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

export default function CheckEmail() {
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
        Check Your Email
      </h1>
      <p className="text-gray-500 text-xs mb-8 text-center">
        Input the code that was sent to your email
      </p>

      {/* Code Input Fields */}
      <div className="flex justify-center gap-3 mb-8">
        <input
          type="text"
          maxLength={1}
          className="w-12 h-12 text-center border border-gray-300 rounded-lg text-black text-lg focus:outline-none focus:border-blue-400"
        />
        <input
          type="text"
          maxLength={1}
          className="w-12 h-12 text-center border border-gray-300 rounded-lg text-black text-lg focus:outline-none focus:border-blue-400"
        />
        <input
          type="text"
          maxLength={1}
          className="w-12 h-12 text-center border border-gray-300 rounded-lg text-black text-lg focus:outline-none focus:border-blue-400"
        />
        <input
          type="text"
          maxLength={1}
          className="w-12 h-12 text-center border border-gray-300 rounded-lg text-black text-lg focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Next Button */}
      <Link href="/new-password" className="text-blue-500 font-medium">
        <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-medium mb-4">
          Next
        </button>      
      </Link>
      

      {/* Resend Code */}
      <p className="text-xs text-center text-black mb-4">
        Didn't get any code?{" "}
        <button className="text-blue-500 font-medium underline">
          Click to resend code
        </button>
      </p>

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