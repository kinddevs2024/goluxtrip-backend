import dbConnect from "../lib/mongoose.js";
import Content from "../lib/models/Content.js";

export default async function handler(req, res) {
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await dbConnect();

    if (req.method === "GET") {
      const content = await Content.find({});
      return res.status(200).json(content);
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "POST" || req.method === "PUT") {
      const { key, text_en, text_ru, text_uz, image } = req.body;
      const updated = await Content.findOneAndUpdate(
        { key },
        { text_en, text_ru, text_uz, image },
        { new: true, upsert: true }
      );
      return res.status(200).json(updated);
    }

    res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
