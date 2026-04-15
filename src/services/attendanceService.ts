import api from "@/lib/axios";

export const attendanceService = {
  getStatus: async (accessToken: string) => {
    const res = await api.get(`/api/attendances/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  clockIn: async (accessToken: string, data: {
    timestamp: string;
    status: string;
    desc: string;
    latitude: number;
    longitude: number;
  }) => {
    const res = await api.post("/api/attendances/clock-in", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  clockOut: async (accessToken: string, data: {
    timestamp: string;
    status: string;
    desc: string;
    latitude: number;
    longitude: number;
  }) => {
    const res = await api.post("/api/attendances/clock-out", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },
};
