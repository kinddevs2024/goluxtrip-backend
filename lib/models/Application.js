import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  car: { type: String },
  dates: { type: String },
  route: { type: String },
  message: { type: String },
  status: { type: String, enum: ["new", "reviewed", "archived"], default: "new" }
}, { timestamps: true });

export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema);
