import knex from "knex";
import { config } from "./config.js";

export const db = knex({
  client: "pg",
  connection: config.databaseUrl
});

export const ensureSchema = async () => {
  const hasEmails = await db.schema.hasTable("emails");
  if (!hasEmails) {
    await db.schema.createTable("emails", (table) => {
      table.uuid("id").primary();
      table.text("sender").notNullable();
      table.text("recipient").notNullable();
      table.text("subject").notNullable();
      table.text("body").notNullable();
      table.timestamp("scheduled_at").notNullable();
      table.timestamp("sent_at");
      table.text("status").notNullable();
      table.text("error");
      table.timestamp("created_at").notNullable().defaultTo(db.fn.now());
      table.timestamp("updated_at").notNullable().defaultTo(db.fn.now());
    });
  }
};
