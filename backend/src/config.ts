import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: parseNumber(process.env.PORT, 4000),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  databaseUrl:
    process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/reachinbox",
  emailDelayMs: parseNumber(process.env.EMAIL_SEND_DELAY_MS, 2000),
  emailRateLimitPerHour: parseNumber(process.env.EMAIL_RATE_LIMIT_PER_HOUR, 200),
  workerConcurrency: parseNumber(process.env.WORKER_CONCURRENCY, 5),
  etherealUser: process.env.ETHEREAL_USER,
  etherealPass: process.env.ETHEREAL_PASS,
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:5173"
};
