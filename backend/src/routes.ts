import { Router } from "express";
import { z } from "zod";
import { emailQueue } from "./queue.js";
import { db } from "./db.js";
import { config } from "./config.js";
import { v4 as uuid } from "uuid";
import { EmailStatus } from "./types.js";

const scheduleSchema = z.object({
  sender: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  recipients: z.array(z.string().email()).min(1),
  scheduledAt: z.string().datetime(),
  delayBetweenMs: z.number().int().positive().optional()
});

const statusFilter = z.enum(["scheduled", "sent", "failed", "rate_limited"]).optional();

export const routes = Router();

routes.post("/api/emails/schedule", async (req, res) => {
  const parsed = scheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { sender, subject, body, recipients, scheduledAt, delayBetweenMs } = parsed.data;
  const baseTime = new Date(scheduledAt).getTime();
  const spacing = delayBetweenMs ?? config.emailDelayMs;
  const created: string[] = [];

  await db.transaction(async (trx) => {
    for (const [index, recipient] of recipients.entries()) {
      const emailId = uuid();
      const scheduledTime = new Date(baseTime + spacing * index);

      await trx("emails").insert({
        id: emailId,
        sender,
        recipient,
        subject,
        body,
        scheduled_at: scheduledTime,
        status: "scheduled" as EmailStatus
      });

      const delay = Math.max(scheduledTime.getTime() - Date.now(), 0);
      await emailQueue.add(
        "send-email",
        {
          emailId,
          sender,
          recipient,
          subject,
          body
        },
        {
          jobId: emailId,
          delay
        }
      );

      created.push(emailId);
    }
  });

  return res.status(201).json({ ids: created });
});

routes.get("/api/emails", async (req, res) => {
  const status = statusFilter.safeParse(req.query.status).success
    ? (req.query.status as EmailStatus | undefined)
    : undefined;

  const query = db("emails").select(
    "id",
    "sender",
    "recipient",
    "subject",
    "scheduled_at as scheduledAt",
    "sent_at as sentAt",
    "status",
    "error"
  );

  if (status) {
    query.where("status", status);
  }

  const emails = await query.orderBy("scheduled_at", "desc");
  return res.json({ emails });
});
