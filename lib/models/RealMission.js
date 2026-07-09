import mongoose from "mongoose";

const RealMissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String },
  image: { type: String, required: true }, // Will hold base64 string
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.RealMission || mongoose.model("RealMission", RealMissionSchema);
