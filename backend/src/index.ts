import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { ensureSchema } from "./db.js";
import { routes } from "./routes.js";

const app = express();

app.use(cors({ origin: config.appBaseUrl }));
app.use(express.json({ limit: "1mb" }));
app.use(routes);

const start = async () => {
  await ensureSchema();
  app.listen(config.port, () => {
    console.log(`API listening on ${config.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
