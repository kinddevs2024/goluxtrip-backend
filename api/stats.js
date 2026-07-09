import dbConnect from "../lib/mongoose.js";
import Stat from "../lib/models/Stat.js";

export default async function handler(req, res) {
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await dbConnect();

    if (req.method === "GET") {
      const stats = await Stat.find({}).sort({ order: 1 });
      return res.status(200).json(stats);
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "POST") {
      const newStat = new Stat(req.body);
      await newStat.save();
      return res.status(201).json(newStat);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await Stat.findByIdAndDelete(id);
      return res.status(200).json({ message: "Deleted" });
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      const updated = await Stat.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(updated);
    }

    res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
