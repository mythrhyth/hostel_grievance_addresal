import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    category: {
      type: String,
      enum: ["plumbing", "electrical", "cleanliness", "internet", "furniture", "security", "pest_control", "other"],
      required: true
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "low"
    },

    spaceType: {
      type: String,
      enum: ["PUBLIC", "PRIVATE"],
      required: true
    },

    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE"],
      default: function () {
        return this.spaceType === "PUBLIC" ? "PUBLIC" : "PRIVATE";
      }
    },

    hostel: { type: String, required: true },
    block: { type: String, required: true },

    room: {
      type: String,
      required: function () {
        return this.spaceType === "PRIVATE";
      }
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: ["REPORTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "REPORTED"
    },

    escalation: {
      level: {
        type: String,
        enum: ["NONE", "WARDEN", "HMC"],
        default: "NONE"
      },
      reason: String,
      escalatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      escalatedAt: Date
    },

    media: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Issue", issueSchema);
