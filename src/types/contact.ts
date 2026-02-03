export type Contact = {
  id: number;
  name: string;
  emails: string[];
  phone_numbers: string[];
  company: string;
  partner_id: number;
  created_at: string;
};

export type ContactListResponse = {
  code: number;
  message: string;
  data: Contact[];
};
