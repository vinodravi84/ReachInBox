import nodemailer from "nodemailer";
import { config } from "./config.js";

let transporter: nodemailer.Transporter | null = null;

export const getTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  if (config.etherealUser && config.etherealPass) {
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: config.etherealUser,
        pass: config.etherealPass
      }
    });
    return transporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  return transporter;
};
