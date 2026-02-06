"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import axiosInstance from "@/lib/axios";
import { logger } from "@/lib/logger";
import { useModal } from "@/hooks/useModal";
import { useNotification } from "@/hooks/useNotification";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { NotificationModal } from "@/components/modals/NotificationModal";
import Link from "next/link";

type AttendanceDetail = {
  id: number;
  date: string;
  clock_in: {
    status: string;
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  clock_out: {
    status: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    desc?: string;
  };
  checked: boolean;
  employee_id: number;
  employee_name: string;
};

interface AttendanceDetailResponse {
  message: string;
  code: number;
  data: AttendanceDetail;
}

export default function AttendanceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const attendanceId = params?.id;

  const [attendance, setAttendance] = useState<AttendanceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (attendanceId) {
      fetchAttendanceDetail();
    }
  }, [attendanceId]);

  const fetchAttendanceDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.info("Fetching attendance detail for ID:", attendanceId);

      const response = await axiosInstance.get<AttendanceDetailResponse>(
        `/api/attendances/${attendanceId}`
      );

      if (response.data.code === 200) {
        logger.success("Attendance detail fetched successfully");
        setAttendance(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch attendance detail");
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      logger.error("Error fetching attendance detail", error);

      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        router.push("/login");
      } else if (error.response?.status === 404) {
        setError("Attendance record not found.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to load attendance detail. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!attendance) return;

    const confirmApprove = window.confirm(
      `Are you sure you want to approve attendance for "${attendance.employee_name || 'this employee'}"?`
    );

    if (!confirmApprove) return;

    try {
      setIsProcessing(true);
      console.log("✅ Approving attendance:", attendance.id);

      const response = await axiosInstance.patch(
        `/api/attendances/${attendance.id}/check`
      );

      if (response.data.code === 200) {
        console.log("✅ Attendance approved successfully");
        console.log("📦 Updated data:", response.data.data);

        // Update state dengan data dari response API
        if (response.data.data) {
          setAttendance(response.data.data);
        } else {
          // Fallback jika API tidak return data
          setAttendance({
            ...attendance,
            checked: true
          });
        }

        alert("Attendance approved successfully!");
      } else {
        throw new Error(response.data.message || "Failed to approve attendance");
      }
    } catch (err: any) {
      console.error("❌ Error approving attendance:", err);

      if (err.response?.data?.message) {
        alert(`Failed to approve: ${err.response.data.message}`);
      } else {
        alert("Failed to approve attendance. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };



  const formatTime = (timestamp: string) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const openMapLocation = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            <Link href="/human-resources/attendance/recent-activity" className="hover:text-slate-600">
              HR / Attendance
            </Link>
            {" / "}
            <span className="text-slate-600">Detail</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">
            Attendance Detail
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading attendance detail...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !attendance) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            <Link href="/human-resources/attendance/recent-activity" className="hover:text-slate-600">
              HR / Attendance
            </Link>
            {" / "}
            <span className="text-slate-600">Detail</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">
            Attendance Detail
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Failed to Load Data
            </h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => fetchAttendanceDetail()}
                className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition"
              >
                Try Again
              </button>
              <Link
                href="/human-resources/attendance/recent-activity"
                className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-200 transition"
              >
                Back to List
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          <Link
            href="/human-resources/attendance/recent-activity"
            className="hover:text-slate-600 transition"
          >
            HR / Attendance
          </Link>
          {" / "}
          <span className="text-slate-600">Detail</span>
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold mt-1 text-black">
            Attendance Detail
          </h1>
          <Link
            href="/human-resources/attendance/recent-activity"
            className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to List
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Employee Info & Status */}
        <div className="lg:col-span-1 space-y-6">
          {/* Employee Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-1">
                {attendance.employee_name || `Employee #${attendance.employee_id}`}
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                EMP{String(attendance.employee_id).padStart(3, "0")}
              </p>

              {/* Status Badge */}
              <div className="mb-4">
                {attendance.checked ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Pending Approval
                  </span>
                )}
              </div>

              {/* Date */}
              <div className="text-sm text-slate-600">
                <p className="font-medium">{formatDate(attendance.date)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!attendance.checked && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Approve Attendance
                    </>
                  )}
                </button>

              </div>
            </div>
          )}
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clock In Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Clock In</h3>
                <p className="text-sm text-slate-500">Entry time details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                  <p className="text-sm font-medium text-slate-800">
                    {formatDateTime(attendance.clock_in.timestamp)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Time</p>
                  <p className="text-lg font-bold text-sky-600">
                    {formatTime(attendance.clock_in.timestamp)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <p className="text-sm font-medium text-slate-800">
                  {attendance.clock_in.status}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">Location</p>
                  <button
                    onClick={() => {
                      if (attendance.clock_in?.latitude && attendance.clock_in?.longitude) {
                        openMapLocation(
                          attendance.clock_in.latitude,
                          attendance.clock_in.longitude
                        );
                      }
                    }}
                    className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    View on Map
                  </button>
                </div>
                <p className="text-sm font-mono text-slate-700">
                  {attendance.clock_in?.latitude?.toFixed(6) || "0.000000"},{" "}
                  {attendance.clock_in?.longitude?.toFixed(6) || "0.000000"}
                </p>
              </div>
            </div>
          </div>

          {/* Clock Out Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Clock Out</h3>
                <p className="text-sm text-slate-500">Exit time details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                  <p className="text-sm font-medium text-slate-800">
                    {formatDateTime(attendance.clock_out.timestamp)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Time</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatTime(attendance.clock_out.timestamp)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <p className="text-sm font-medium text-slate-800">
                  {attendance.clock_out.status}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className={`text-sm ${attendance.clock_out.desc ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                  {attendance.clock_out.desc || "No description provided"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">Location</p>
                  <button
                    onClick={() => {
                      if (attendance.clock_out?.latitude && attendance.clock_out?.longitude) {
                        openMapLocation(
                          attendance.clock_out.latitude,
                          attendance.clock_out.longitude
                        );
                      }
                    }}
                    className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    View on Map
                  </button>
                </div>
                <p className="text-sm font-mono text-slate-700">
                  {attendance.clock_out?.latitude?.toFixed(6) || "0.000000"},{" "}
                  {attendance.clock_out?.longitude?.toFixed(6) || "0.000000"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}