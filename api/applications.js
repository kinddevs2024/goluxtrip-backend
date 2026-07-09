import dbConnect from "../lib/mongoose.js";
import Application from "../lib/models/Application.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    await dbConnect();

    if (req.method === "GET") {
      const apps = await Application.find({}).sort({ createdAt: -1 });
      return res.status(200).json(apps);
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      const updated = await Application.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await Application.findByIdAndDelete(id);
      return res.status(200).json({ message: "Deleted" });
    }

    res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
