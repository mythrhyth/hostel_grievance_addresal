import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    type: {
      type: String,
      enum: ["info", "warning", "urgent", "maintenance"],
      default: "info",
      required: true
    },
    targetHostels: [{
      type: String,
      required: true
    }],
    targetBlocks: [{
      type: String
    }],
    targetRoles: [{
      type: String,
      enum: ["student", "caretaker", "management"]
    }],
    isPinned: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll"
    },
    hasPoll: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for efficient queries
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ targetHostels: 1 });
announcementSchema.index({ targetRoles: 1 });
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual to check if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

export default mongoose.model("Announcement", announcementSchema);
