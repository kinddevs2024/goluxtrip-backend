import { z } from "zod";
import dbConnect from "../lib/mongoose.js";
import Application from "../lib/models/Application.js";
import nodemailer from "nodemailer";

const applicationSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(2).max(40).optional().default(""),
  car: z.string().min(2).max(80),
  dates: z.string().min(2).max(300),
  route: z.string().min(2).max(800),
  message: z.string().max(2000).optional().default("")
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const parsed = applicationSchema.safeParse(req.body);

  if (!parsed.success) {
    console.error("Validation error:", parsed.error.flatten());
    res.status(400).json({ message: "Please check the application fields.", errors: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;

  try {
    await dbConnect();
    const newApp = new Application(data);
    await newApp.save();

    // Send email notification if SMTP is configured
    if (process.env.SMTP_HOST && process.env.EMAIL_TO) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: #0a2240; padding: 30px 40px;">
      <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: 2px; text-transform: uppercase;">🚗 New Transportation Request</h1>
      <p style="color: #E84E12; margin: 8px 0 0; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">${data.car}</p>
    </div>
    <!-- Body -->
    <div style="padding: 30px 40px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 12px 0; color: #888; font-size: 12px; font-weight: bold; text-transform: uppercase; width: 140px;">Contact</td>
          <td style="padding: 12px 0; color: #0a2240; font-weight: bold; font-size: 15px;">${data.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 12px 0; color: #888; font-size: 12px; font-weight: bold; text-transform: uppercase;">Email</td>
          <td style="padding: 12px 0;"><a href="mailto:${data.email}" style="color: #E84E12;">${data.email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 12px 0; color: #888; font-size: 12px; font-weight: bold; text-transform: uppercase;">Phone</td>
          <td style="padding: 12px 0;"><a href="tel:${data.phone}" style="color: #0a2240;">${data.phone || "—"}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 12px 0; color: #888; font-size: 12px; font-weight: bold; text-transform: uppercase;">Service</td>
          <td style="padding: 12px 0; background: #fff8f5;"><span style="background: #E84E12; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${data.car}</span></td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 12px 0; color: #888; font-size: 12px; font-weight: bold; text-transform: uppercase;">Dates</td>
          <td style="padding: 12px 0; color: #0a2240;">${data.dates}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 12px 0; color: #888; font-size: 12px; font-weight: bold; text-transform: uppercase;">Route Info</td>
          <td style="padding: 12px 0; color: #0a2240;">${data.route}</td>
        </tr>
        ${data.message ? `
        <tr>
          <td style="padding: 12px 0; color: #888; font-size: 12px; font-weight: bold; text-transform: uppercase; vertical-align: top;">Notes</td>
          <td style="padding: 12px 0; color: #555;">${data.message}</td>
        </tr>` : ""}
      </table>

      <!-- WhatsApp Quick Reply -->
      <div style="margin-top: 24px; padding: 16px; background: #f0fff4; border-radius: 10px; border-left: 4px solid #25D366;">
        <p style="margin: 0; color: #1a7a3f; font-size: 13px; font-weight: bold;">💬 Quick Reply via WhatsApp</p>
        <a href="https://wa.me/${(process.env.WHATSAPP_NUMBER || "998946264346")}?text=Hi%20${encodeURIComponent(data.name)}%2C%20thank%20you%20for%20your%20request!" 
           style="display: inline-block; margin-top: 8px; background: #25D366; color: white; padding: 8px 18px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold;">
          Open WhatsApp
        </a>
      </div>
    </div>
    <!-- Footer -->
    <div style="background: #f9f9f9; padding: 20px 40px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #aaa; font-size: 12px;">GoLuxTrip Transportation — info@goluxtrip.com — +998 (94) 626-43-46</p>
    </div>
  </div>
</body>
</html>`;

        await transporter.sendMail({
          from: `"GoLuxTrip Request" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
          to: process.env.EMAIL_TO,
          replyTo: data.email,
          subject: `🚗 New Request: ${data.car} — ${data.name}`,
          text: `New transportation request:\n\nContact: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nService: ${data.car}\nDates: ${data.dates}\nRoute: ${data.route}\nNotes: ${data.message}`,
          html: htmlBody
        });

        console.log("Email sent to", process.env.EMAIL_TO);
      } catch (emailErr) {
        console.error("Email failed (request still saved to DB):", emailErr.message);
      }
    } else {
      console.warn("SMTP not configured — email not sent. Request saved to DB.");
    }

    res.status(200).json({ message: "Application sent and saved." });
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
