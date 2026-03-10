import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceService } from "@/services/attendanceService";
import type { AttendanceLocation } from "@/types/location";

export const useClockOut = () => {
  const { user, accessToken } = useAuth();
  const [clockedOut, setClockedOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [coordinates, setCoordinates] = useState<AttendanceLocation | null>(null);
  const [workDescription, setWorkDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clockOutTime, setClockOutTime] = useState<Date | null>(null);

  useEffect(() => {
    const checkTodayAttendance = async () => {
      if (user && accessToken) {
        try {
          const data = await attendanceService.getStatus(accessToken);
          
          if (data?.data?.clocked_out) {
            setClockedOut(true);
            if (data.data.attendance?.clock_out?.timestamp) {
              setClockOutTime(new Date(data.data.attendance.clock_out.timestamp));
            }
          } else {
            setClockedOut(false);
          }
        } catch (error: any) {
          console.error('Error checking attendance:', error);
          setClockedOut(false);
        }
      }
    };
    
    checkTodayAttendance();
  }, [user, accessToken]);

  const handleClockOut = async () => {
    setIsSubmitting(true);

    try {
      await attendanceService.clockOut(accessToken!, {
        timestamp: new Date().toISOString(),
        status: "On Time",
        desc: workDescription || "Clock out via web app",
        latitude: coordinates?.lat ?? 0,
        longitude: coordinates?.lng ?? 0,
      });

      const clockTime = new Date();
      setClockOutTime(clockTime);
      setClockedOut(true);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.message || "Gagal melakukan absensi pulang. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user,
    clockedOut,
    showConfirmModal,
    showSuccessModal,
    location,
    coordinates,
    workDescription,
    isSubmitting,
    clockOutTime,
    setShowConfirmModal,
    setShowSuccessModal,
    setLocation,
    setCoordinates,
    setWorkDescription,
    handleClockOut,
  };
};
