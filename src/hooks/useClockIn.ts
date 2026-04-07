import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceService } from "@/services/attendanceService";
import type { AttendanceLocation } from "@/types/location";

export const useClockIn = () => {
  const { user, accessToken } = useAuth();
  const [clockedIn, setClockedIn] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [coordinates, setCoordinates] = useState<AttendanceLocation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<"Hadir" | "Izin" | "Sakit">("Hadir");
  const [keterangan, setKeterangan] = useState<string>("");

  useEffect(() => {
    const checkTodayAttendance = async () => {
      if (user && accessToken) {
        try {
          const data = await attendanceService.getStatus(accessToken);
          
          if (data?.data?.clocked_in) {
            setClockedIn(true);
            if (data.data.attendance?.clock_in?.timestamp) {
              setClockInTime(new Date(data.data.attendance.clock_in.timestamp));
            }
          } else {
            setClockedIn(false);
          }
        } catch (error: any) {
          console.error('Error checking attendance:', error);
          setClockedIn(false);
        }
      }
    };
    
    checkTodayAttendance();
  }, [user, accessToken]);

  const handleClockIn = async () => {
    setIsSubmitting(true);

    try {
      await attendanceService.clockIn(accessToken!, {
        timestamp: new Date().toISOString(),
        status: attendanceStatus === "Hadir" ? "On Time" : attendanceStatus,
        desc: attendanceStatus === "Izin" && keterangan ? keterangan : `Clock in via web app - ${attendanceStatus}`,
        latitude: coordinates?.lat ?? 0,
        longitude: coordinates?.lng ?? 0,
      });

      const clockTime = new Date();
      setClockInTime(clockTime);
      setClockedIn(true);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error(error.response?.data || error);
      
      if (error.response?.status === 400 && error.response?.data?.message === "Already clocked in today") {
        alert("Anda sudah melakukan absensi masuk hari ini.");
        setClockedIn(true);
        setShowConfirmModal(false);
      } else {
        alert(error.response?.data?.message || "Gagal melakukan absensi. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
