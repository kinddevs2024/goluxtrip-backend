import dbConnect from "../lib/mongoose.js";
import Partner from "../lib/models/Partner.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await dbConnect();

    if (req.method === "GET") {
      const partners = await Partner.find().sort({ createdAt: -1 });
      return res.status(200).json(partners);
    }

    if (req.method === "POST") {
      const { name, image } = req.body;
      const partner = await Partner.create({ name, image });
      return res.status(201).json(partner);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await Partner.findByIdAndDelete(id);
      return res.status(200).json({ message: "Partner deleted" });
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
