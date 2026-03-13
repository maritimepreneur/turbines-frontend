"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export function useScholarshipList() {
  const [scholarshipData, setScholarshipData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScholarships = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/scholarships");

      setScholarshipData(response.data || []);
    } catch (error) {
      console.error("Error fetching scholarships", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  return {
    scholarshipData,
    loading,
    fetchScholarships,
  };
}