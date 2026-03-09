"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin, User, CheckCircle, DoorOpen } from "lucide-react";
import LocationMap from "@/components/LocationMap"
import TimeStamp from "@/components/TimeStamp"
import { useClockIn } from "@/hooks/useClockIn";

export default function ClockInPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const {
    user,
    clockedIn,
    showConfirmModal,
    showSuccessModal,
    location,
    coordinates,
    isSubmitting,
    clockInTime,
    attendanceStatus,
    keterangan,
    setShowConfirmModal,
    setShowSuccessModal,
    setLocation,
    setCoordinates,
    setAttendanceStatus,
    setKeterangan,
    handleClockIn,
  } = useClockIn();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <p className="text-sm text-slate-400">
          Employee / Attendance /{" "}
          <span className="text-slate-600">Clock In</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Clock In</h1>
      </div>

      {/* Clock In Card */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-black max-w-lg mx-auto">
        {/* Profile Section */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 p-2 sm:p-3 bg-slate-50 rounded-lg">
          <div className="relative">
            <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
              <User size={28} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base">{user?.username}</h3>
            <p className="text-slate-600 text-xs sm:text-sm capitalize">{user?.role || 'Employee'}</p>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-center mb-2 sm:mb-3 relative">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl -z-10"></div>

          <div className="py-1 sm:py-2 px-3 sm:px-4">
            {/* Animated Clock Icon */}
            <div className="relative inline-block mb-1">
              <div className="absolute inset-0 bg-sky-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-sky-400 to-blue-500 p-2 sm:p-3 rounded-full shadow-lg">
                <Clock size={18} className="text-white sm:w-5 sm:h-5" strokeWidth={2.5} />
              </div>
            </div>

            <TimeStamp currentTime={currentTime} />
          </div>
        </div>

        {/* Location Section with Map */}
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <MapPin size={14} className="text-blue-600 sm:w-4 sm:h-4" />
            <p className="text-xs font-medium text-blue-800">Lokasi Saat Ini</p>
          </div>

          <LocationMap
            height="150px"
            onLocationChange={(lat, lng, address) => {
              setCoordinates({ lat, lng, address });
              setLocation(address);
            }}
          />

          {location && coordinates && (
            <div className="mt-1 sm:mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-900 font-medium mb-1">Address :</p>
              <p className="text-xs text-blue-700">{location}</p>
            </div>
          )}
        </div>

        {/* Attendance Status Dropdown */}
        <div className="mb-2 sm:mb-3">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Status Kehadiran
          </label>
          <select
            value={attendanceStatus}
            onChange={(e) => {
              setAttendanceStatus(e.target.value as "Hadir" | "Izin" | "Sakit")
              if (e.target.value !== "Izin") setKeterangan("")
            }}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Hadir">Hadir</option>
            <option value="Izin">Izin</option>
            <option value="Sakit">Sakit</option>
          </select>
        </div>

        {/* Keterangan Field - Only show when Izin is selected */}
        {attendanceStatus === "Izin" && (
          <div className="mb-2 sm:mb-3">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Keterangan Izin <span className="text-red-500">*</span>
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Masukkan alasan izin..."
              rows={2}
              className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Action Button */}
        {!clockedIn ? (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={!location || !coordinates || (attendanceStatus === "Izin" && !keterangan.trim())}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition w-full flex items-center justify-center gap-2 ${!location || !coordinates || (attendanceStatus === "Izin" && !keterangan.trim())
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
              }`}
          >
            <DoorOpen size={18} className="sm:w-5 sm:h-5" />
            {!location || !coordinates ? "Menunggu Lokasi..." : (attendanceStatus === "Izin" && !keterangan.trim()) ? "Isi Keterangan Izin" : "Absen Masuk"}
          </button>
        ) : (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 px-2 sm:px-3 py-2 rounded-lg mb-2 sm:mb-3 flex items-center justify-center gap-2 text-xs sm:text-sm">
              <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              Berhasil absen pada {clockInTime?.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' })} Pukul {clockInTime?.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':')}
            </div>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold w-full cursor-not-allowed"
            >
              Sudah Absen Hari Ini
            </button>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-[9999]">
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
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                >
                  Tidak
                </button>
                <button
                  onClick={handleClockIn}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Memproses...' : 'Ya'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-[9999]">
          <div className="bg-white border-2 border-blue-500 rounded-xl p-6 max-w-sm mx-4">
            <div className="text-center">
              <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-2 text-green-800">
                Berhasil Absen!
              </h3>
              <p className="text-slate-600 mb-4">
                Absensi masuk berhasil dicatat pada{" "}
                {clockInTime?.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' })} Pukul {clockInTime?.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':')}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
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
