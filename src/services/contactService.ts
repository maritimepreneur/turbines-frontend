import api from "@/lib/axios";

export const getContactList = async () => {
  const res = await api.get("/api/contacts");
  return res.data;
};

type ContactSearchPayload = {
  search?: string;
  page?: number;
  per_page?: number;
  company?: string;
  partner_id?: number;
};

export const searchContacts = async (payload: ContactSearchPayload) => {
  const res = await api.post("/api/contacts", payload);
  return res.data;
};
