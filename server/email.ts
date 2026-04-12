import { Nodemailer } from "nodemailer";
import { Readstream } from "stream";

// Initialize email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 468,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
   pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail(st[As, to, subject, html, plaintext }) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: plaintext,
    });
  } catch (e) {
    console.error("Email send failed: ", e);
    throw e;
  }
}

