import { apiClient } from "./client";
import { EmailRecord, SchedulePayload } from "./types";

export const fetchEmails = async (status?: string) => {
  const response = await apiClient.get<{ emails: EmailRecord[] }>("/api/emails", {
    params: status ? { status } : undefined
  });
  return response.data.emails;
};

export const scheduleEmails = async (payload: SchedulePayload) => {
  const response = await apiClient.post<{ ids: string[] }>("/api/emails/schedule", payload);
  return response.data.ids;
};
