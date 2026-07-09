import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";

export default function handler(req, res) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username, password } = req.body;

  // Hardcoded for now as requested
  if (username === "admin" && password === "admin123") {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
}
