import { Queue, QueueScheduler } from "bullmq";
import IORedis from "ioredis";
import { config } from "./config.js";

export const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null
});

export const emailQueueName = "email-send";

export const emailQueue = new Queue(emailQueueName, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 50
  }
});

export const emailQueueScheduler = new QueueScheduler(emailQueueName, {
  connection
});

export const closeQueue = async () => {
  await emailQueueScheduler.close();
  await emailQueue.close();
  await connection.quit();
};
