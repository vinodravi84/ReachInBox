export type EmailStatus = "scheduled" | "sent" | "failed" | "rate_limited";

export interface EmailJobPayload {
  emailId: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
}
