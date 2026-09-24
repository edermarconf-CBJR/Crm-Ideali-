import "server-only";
import nodemailer from "nodemailer";
export async function enviarMensagem(
  destino: string,
  assunto: string,
  texto: string,
) {
  const transporte = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
    connectionTimeout: 5000,
    socketTimeout: 10000,
  });
  try {
    await transporte.sendMail({
      from: process.env.SMTP_FROM,
      to: destino,
      subject: assunto,
      text: texto,
    });
  } finally {
    transporte.close();
  }
}
