"use client";

import { useParams } from "next/navigation";
import AttendanceDetailView from "@/components/attendance/AttendanceDetailView";

export default function SummaryAttendanceDetailPage() {
    const params = useParams();
    const attendanceId = params?.id as string;
    const employeeId = params?.employeeId as string;

    const backHref = `/human-resources/attendance/summary/${employeeId}`;

    return (
        <AttendanceDetailView
            attendanceId={attendanceId}
            breadcrumbs={[
                { label: "HR / Attendance / Summary", href: "/human-resources/attendance/summary" },
                { label: "History", href: backHref },
                { label: "Detail" },
            ]}
            backHref={backHref}
            backLabel="Back to History"
        />
    );
}
