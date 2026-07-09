import mongoose from "mongoose";

const StatSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
});

export default mongoose.models.Stat || mongoose.model("Stat", StatSchema);
