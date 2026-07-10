import dbConnect from "../lib/mongoose.js";
import Project from "../lib/models/Project.js";

export default async function handler(req, res) {
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await dbConnect();

    if (req.method === "GET") {
      const projects = await Project.find({}).sort({ createdAt: -1 });
      return res.status(200).json(projects);
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "POST") {
      const newProject = new Project(req.body);
      await newProject.save();
      return res.status(201).json(newProject);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await Project.findByIdAndDelete(id);
      return res.status(200).json({ message: "Deleted" });
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      const updated = await Project.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(updated);
    }

    res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
