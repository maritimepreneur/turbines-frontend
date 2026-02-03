"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AttendancePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/hr/attendance/recent-activity")
  }, [router])

  return null
}