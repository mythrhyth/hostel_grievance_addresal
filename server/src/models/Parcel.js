import mongoose from "mongoose";

const parcelSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  courierName: String,
  trackingNumber: String,

  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  receivedAt: Date,

  status: {
    type: String,
    enum: ["RECEIVED", "COLLECTED"],
    default: "RECEIVED"
  }
});

export default mongoose.model("Parcel", parcelSchema);
