import dbConnect from "../lib/mongoose.js";
import RealMission from "../lib/models/RealMission.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await dbConnect();

    if (req.method === "GET") {
      const missions = await RealMission.find({}).sort({ createdAt: -1 });
      return res.status(200).json(missions);
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // Using base64 strings so limit payload size in production if needed
    if (req.method === "POST") {
      const newMission = new RealMission(req.body);
      await newMission.save();
      return res.status(201).json(newMission);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await RealMission.findByIdAndDelete(id);
      return res.status(200).json({ message: "Deleted" });
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      const updated = await RealMission.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(updated);
    }

    res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
