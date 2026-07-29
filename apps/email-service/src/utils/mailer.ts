import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.join(__dirname, "../assets");

const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER || "developer.induwara@gmail.com";
  const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  // 1. Preferred: Gmail App Password (never expires like 7-day GCP testing OAuth tokens)
  if (emailPass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  // 2. Fallback: OAuth2
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: emailUser,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });
};

const getCidAttachments = (html?: string) => {
  if (!html) return [];
  const assetNames = ["logo", "party", "tag", "truck", "card", "headset", "shield", "return", "star"];
  const attachments = [];

  for (const name of assetNames) {
    // Only attach image if cid:name is actually referenced in the HTML body
    if (html.includes(`cid:${name}`)) {
      const pngPath = path.join(assetsDir, `${name}.png`);
      if (fs.existsSync(pngPath)) {
        attachments.push({
          filename: `${name}.png`,
          path: pngPath,
          cid: name,
        });
      }
    }
  }

  return attachments;
};

const sendMail = async ({
  email,
  subject,
  text,
  html,
}: {
  email: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  try {
    const transporter = getTransporter();
    const attachments = getCidAttachments(html);

    const res = await transporter.sendMail({
      from: `"Ominify" <${process.env.EMAIL_USER || "developer.induwara@gmail.com"}>`,
      to: email,
      subject,
      text,
      html,
      attachments,
    });

    console.log("EMAIL SENT SUCCESSFULLY TO:", email, "MessageId:", res.messageId);
    return res;
  } catch (error) {
    console.error("NODEMAILER SEND MAIL ERROR:", error);
    throw error;
  }
};

export default sendMail;