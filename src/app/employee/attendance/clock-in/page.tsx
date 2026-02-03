"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin, User, CheckCircle, DoorOpen } from "lucide-react";
import Image from "next/image"

export default function ClockInPage() {
  const [clockedIn, setClockedIn] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [location, setLocation] = useState<string>("Mendapatkan lokasi...")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate getting location
    setTimeout(() => {
      setLocation("Jakarta Selatan, DKI Jakarta")
    }, 2000)

    return () => clearInterval(timer)
  }, [])

  const handleClockInClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmYes = () => {
    setClockedIn(true)
    setShowConfirmModal(false)
    setShowSuccessModal(true)
  }

  const handleConfirmNo = () => {
    setShowConfirmModal(false)
  }

  const handleCloseSuccess = () => {
    setShowSuccessModal(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Employee / Attendance /{" "}
          <span className="text-slate-600">Clock In</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Clock In</h1>
      </div>

      {/* Clock In Card */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-black max-w-lg mx-auto">
        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="relative">
            <Image
              src="/api/placeholder/80/80"
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full border-4 border-white shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Yoel Ginting</h3>
            <p className="text-slate-600">Web Developer</p>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-center mb-6">
          <Clock size={48} className="mx-auto mb-3 text-sky-500" />
          <div className="text-4xl font-bold text-slate-800 mb-2">
            {currentTime.toLocaleTimeString("id-ID")}
          </div>
          <div className="text-slate-600">
            {currentTime.toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Location Section */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 rounded-lg">
          <MapPin size={20} className="text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">Lokasi Saat Ini</p>
            <p className="text-sm text-blue-600">{location}</p>
          </div>
        </div>

        {/* Action Button */}
        {!clockedIn ? (
          <button
            onClick={handleClockInClick}
            className="bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition w-full flex items-center justify-center gap-2"
          >
            <DoorOpen size={20} />
            Absen Masuk
          </button>
        ) : (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              Berhasil absen pada {currentTime.toLocaleTimeString("id-ID")}
            </div>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-8 py-4 rounded-lg text-lg font-semibold w-full cursor-not-allowed"
            >
              Sudah Absen Hari Ini
            </button>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-blue-500 rounded-xl p-6 max-w-sm mx-4">
            <div className="text-center">
              <h3 className="text-lg text-black font-semibold mb-2">
                Konfirmasi Absensi Masuk
              </h3>
              <p className="text-slate-600 mb-6">
                Apakah Anda yakin ingin absen hari ini?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmNo}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                >
                  Tidak
                </button>
                <button
                  onClick={handleConfirmYes}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                >
                  Ya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-blue-500 rounded-xl p-6 max-w-sm mx-4">
            <div className="text-center">
              <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-2 text-green-800">
                Berhasil Absen!
              </h3>
              <p className="text-slate-600 mb-4">
                Absensi masuk berhasil dicatat pada{" "}
                {currentTime.toLocaleTimeString("id-ID")}
              </p>
              <button
                onClick={handleCloseSuccess}
                className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
