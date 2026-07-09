import { z } from "zod";
import dbConnect from "../lib/mongoose.js";
import Application from "../lib/models/Application.js";
import nodemailer from "nodemailer";

const applicationSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(2).max(40).optional(),
  car: z.string().min(2).max(80),
  dates: z.string().min(2).max(120),
  route: z.string().min(2).max(500),
  message: z.string().max(1000).optional().default("")
});

export default async function handler(req, res) {
  // CORS setup
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "*"
  );

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
    res.status(400).json({ message: "Please check the application fields." });
    return;
  }

  const data = parsed.data;

  try {
    await dbConnect();
    const newApp = new Application(data);
    await newApp.save();

    // Optionally send email if env vars are present
    if (process.env.SMTP_HOST && process.env.EMAIL_TO) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        await transporter.sendMail({
          from: `"GoLuxTrip Landing" <${process.env.EMAIL_FROM}>`,
          to: process.env.EMAIL_TO,
          replyTo: data.email,
          subject: `New GoLuxTrip request - ${data.car}`,
          text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nCar: ${data.car}\nDates: ${data.dates}\nRoute: ${data.route}\nMessage: ${data.message}`
        });
      } catch (emailErr) {
        console.error("Email failed, but saved to DB", emailErr);
      }
    }

    res.status(200).json({ message: "Application sent and saved." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
}
