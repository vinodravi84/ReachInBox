import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { config } from "./config.js";
import { emailQueueName } from "./queue.js";
import { db } from "./db.js";
import { EmailJobPayload } from "./types.js";
import { getTransporter } from "./email.js";
import nodemailer from "nodemailer";

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null
});

const rateLimitScript = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])
local current = tonumber(redis.call("GET", key) or "0")
if current >= limit then
  return 0
end
current = redis.call("INCR", key)
if current == 1 then
  redis.call("PEXPIRE", key, ttl)
end
return 1
`;

const getWindowKey = (sender: string) => {
  const now = new Date();
  const hourStart = new Date(now);
  hourStart.setMinutes(0, 0, 0);
  return {
    key: `rate:${sender}:${hourStart.toISOString()}`,
    ttl: 60 * 60 * 1000 - (now.getTime() - hourStart.getTime())
  };
};

const moveToNextHour = async (job: Job) => {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  const delay = nextHour.getTime() - now.getTime();
  await job.updateData({
    ...(job.data as EmailJobPayload),
    rescheduledAt: nextHour.toISOString()
  });
  await db("emails")
    .where({ id: (job.data as EmailJobPayload).emailId })
    .update({ scheduled_at: nextHour, updated_at: db.fn.now() });
  if (!job.token) {
    throw new Error("Missing job token for delayed move.");
  }
  await job.moveToDelayed(Date.now() + delay, job.token);
};

const worker = new Worker<EmailJobPayload>(
  emailQueueName,
  async (job) => {
    const payload = job.data;
    const existing = await db("emails").where({ id: payload.emailId }).first();
    if (!existing || existing.status === "sent") {
      return;
    }

    const { key, ttl } = getWindowKey(payload.sender);
    const allowed = Number(
      await connection.eval(rateLimitScript, 1, key, config.emailRateLimitPerHour, ttl)
    );

    if (allowed === 0) {
      await db("emails")
        .where({ id: payload.emailId })
        .update({ status: "rate_limited", updated_at: db.fn.now() });
      await moveToNextHour(job);
      return;
    }

    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: payload.sender,
      to: payload.recipient,
      subject: payload.subject,
      text: payload.body
    });

    await db("emails")
      .where({ id: payload.emailId })
      .update({
        status: "sent",
        sent_at: db.fn.now(),
        updated_at: db.fn.now(),
        error: null
      });

    if (nodemailer.getTestMessageUrl) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) {
        console.log(`Preview URL: ${preview}`);
      }
    }
  },
  {
    connection,
    concurrency: config.workerConcurrency,
    limiter: {
      max: 1,
      duration: config.emailDelayMs
    }
  }
);

worker.on("failed", async (job, err) => {
  if (!job) {
    return;
  }
  await db("emails")
    .where({ id: job.data.emailId })
    .update({ status: "failed", error: err.message, updated_at: db.fn.now() });
});

const shutdown = async () => {
  await worker.close();
  await connection.quit();
  await db.destroy();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
