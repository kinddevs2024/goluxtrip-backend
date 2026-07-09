import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "about_us"
  text_en: { type: String },
  text_ru: { type: String },
  text_uz: { type: String },
  image: { type: String }, // Base64
}, { timestamps: true });

export default mongoose.models.Content || mongoose.model("Content", ContentSchema);
