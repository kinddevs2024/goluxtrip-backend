import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String },
    image: { type: String, required: true },
    photos: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
