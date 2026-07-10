import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Partner || mongoose.model("Partner", PartnerSchema);
