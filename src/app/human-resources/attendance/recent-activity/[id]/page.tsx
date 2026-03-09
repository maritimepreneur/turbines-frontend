"use client";

import { useParams } from "next/navigation";
import AttendanceDetailView from "@/components/attendance/AttendanceDetailView";

export default function AttendanceDetailPage() {
  const params = useParams();
  const attendanceId = params?.id as string;

  return (
    <AttendanceDetailView
      attendanceId={attendanceId}
      breadcrumbs={[
        { label: "HR / Attendance", href: "/human-resources/attendance/recent-activity" },
        { label: "Detail" },
      ]}
      backHref="/human-resources/attendance/recent-activity"
      backLabel="Back to List"
    />
  );
}