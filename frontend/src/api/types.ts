export type EmailStatus = "scheduled" | "sent" | "failed" | "rate_limited";

export interface EmailRecord {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  scheduledAt: string;
  sentAt?: string | null;
  status: EmailStatus;
  error?: string | null;
}

export interface SchedulePayload {
  sender: string;
  subject: string;
  body: string;
  recipients: string[];
  scheduledAt: string;
  delayBetweenMs?: number;
}
