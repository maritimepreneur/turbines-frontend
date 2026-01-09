import Link from "next/link"
import Image from "next/image"

export default function LoginForm() {
  return (
    <div>
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <Image
          src="/logo_marmud.png"       // ganti dengan path logo kamu
          alt="Logo Maritim Muda"
          width={120}           // sesuaikan ukuran
          height={40}           // sesuaikan ukuran
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

      {/* Email */}
      <label className="text-xs font-semibold text-black">Email Address</label>
      <input
        type="email"
        className="w-full mt-1 mb-4 px-4 py-2 border border-blue-400 rounded-xl  focus:outline-none"
      />

      {/* Password */}
      <label className="text-xs text-black font-semibold">Password</label>
      <input
        type="password"
        className="w-full mt-1 mb-4 px-4 py-2 border border-blue-400 rounded-xl focus:outline-none"
      />

      {/* Remember & Forgot */}
      <div className="flex justify-between items-center text-xs mb-6">
        <label className="flex items-center gap-2 text-black">
          <input type="checkbox" className=" border-2 border-blue-500 accent-blue-500 rounded-sm"/>
          Remember me
        </label>
        <Link href="/forgot-password" className="text-blue-500 ">
          Forgot password?
        </Link>
      </div>

      {/* Button */}
      <button className="w-full  bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-xl  font-medium mb-4">
        Login
      </button>

      {/* Sign Up */}
      <p className="text-xs text-center text-black">
        Don’t have account?{" "}
        <Link href="/signup" className="text-blue-500 font-medium">
          Sign Up
        </Link>
      </p>
    </div>
  )
}
