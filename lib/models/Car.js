import mongoose from "mongoose";

const CarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  seats: { type: String, required: true },
  bags: { type: String, required: true },
  drive: { type: String, required: true },
  image: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Car || mongoose.model("Car", CarSchema);
