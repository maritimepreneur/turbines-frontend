"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin, User, CheckCircle, DoorOpen } from "lucide-react";
import Image from "next/image"
import LocationMap from "@/components/LocationMap"
import TimeStamp from "@/components/TimeStamp"
import type { AttendanceLocation } from "@/types/location"
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";


export default function ClockInPage() {
  const { user, accessToken } = useAuth();
  const [clockedIn, setClockedIn] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [location, setLocation] = useState<string>("")
  const [coordinates, setCoordinates] = useState<AttendanceLocation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clockInTime, setClockInTime] = useState<Date | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleClockInClick = () => {
    setShowConfirmModal(true)
  }

  useEffect(() => {
    if (user) {
      // Use Asia/Jakarta timezone for date consistency
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
      const storedDate = localStorage.getItem(`attendance_clock_in_date_${user.id}`);
      const storedTime = localStorage.getItem(`attendance_clock_in_time_${user.id}`);

      if (storedDate === today && storedTime) {
        setClockedIn(true);
        setClockInTime(new Date(storedTime));
      }
    }
  }, [user]);

  const handleConfirmYes = async () => {
    setIsSubmitting(true);

    try {
      const res = await api.post(
        "/api/attendances/clock-in",
        {
          timestamp: new Date().toISOString(),
          status: "On Time",
          desc: "Clock in via web app",
          latitude: coordinates?.lat ?? 0,
          longitude: coordinates?.lng ?? 0,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const clockTime = new Date();
      setClockInTime(clockTime);
      setClockedIn(true);
      setShowConfirmModal(false);
      setShowSuccessModal(true);

      // Save to localStorage with Asia/Jakarta timezone
      if (user) {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        localStorage.setItem(`attendance_clock_in_date_${user.id}`, today);
        localStorage.setItem(`attendance_clock_in_time_${user.id}`, clockTime.toISOString());
      }

    } catch (error: any) {
      console.error(error.response?.data || error);
      alert(
        error.response?.data?.message ||
        "Gagal melakukan absensi. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleConfirmNo = () => {
    setShowConfirmModal(false)
  }

  const handleCloseSuccess = () => {
    setShowSuccessModal(false)
  }

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
      <div className="bg-white rounded-xl shadow-sm p-8 text-black max-w-lg mx-auto">
        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="relative">
            <Image
              src="/api/placeholder/80/80"
              alt="Profile"
              width={65}
              height={65}
              className="rounded-full border-4 border-white shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user?.username}</h3>
            <p className="text-slate-600 capitalize">{user?.role || 'Employee'}</p>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-center mb-4 relative">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl -z-10"></div>

          <div className="py-2 px-6">
            {/* Animated Clock Icon */}
            <div className="relative inline-block mb-2">
              <div className="absolute inset-0 bg-sky-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-sky-400 to-blue-500 p-4 rounded-full shadow-lg">
                <Clock size={25} className="text-white" strokeWidth={2.5} />
              </div>
            </div>

            <TimeStamp currentTime={currentTime} />
          </div>
        </div>

        {/* Location Section with Map */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-blue-600" />
            <p className="text-sm font-medium text-blue-800">Lokasi Saat Ini</p>
          </div>

          <LocationMap
            height="250px"
            onLocationChange={(lat, lng, address) => {
              setCoordinates({ lat, lng, address });
              setLocation(address);
            }}
          />

          {location && coordinates && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-900 font-medium mb-1">Address :</p>
              <p className="text-sm text-blue-700">{location}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!clockedIn ? (
          <button
            onClick={handleClockInClick}
            disabled={!location || !coordinates}
            className={`px-8 py-4 rounded-lg text-lg font-semibold transition w-full flex items-center justify-center gap-2 ${!location || !coordinates
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
              }`}
          >
            <DoorOpen size={20} />
            {!location || !coordinates ? "Menunggu Lokasi..." : "Absen Masuk"}
          </button>
        ) : (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              Berhasil absen pada {clockInTime?.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} Pukul {clockInTime?.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }).replace('.', ':')}
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
                  onClick={handleConfirmNo}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                >
                  Tidak
                </button>
                <button
                  onClick={handleConfirmYes}
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
                {clockInTime?.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} Pukul {clockInTime?.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }).replace('.', ':')}
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
