import mongoose from "mongoose";

const lostAndFoundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    category: {
      type: String,
      enum: ["electronics", "clothing", "documents", "accessories", "books", "keys", "wallet", "other"],
      required: true
    },
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true
    },
    status: {
      type: String,
      enum: ["active", "claimed", "resolved"],
      default: "active"
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    dateLostOrFound: {
      type: Date,
      required: true
    },
    contactInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100
      },
      room: {
        type: String,
        trim: true,
        maxlength: 20
      }
    },
    images: [{
      type: String,
      required: false
    }],
    tags: [{
      type: String,
      trim: true,
      maxlength: 50
    }],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    hostel: {
      type: String,
      required: true,
      trim: true
    },
    block: {
      type: String,
      trim: true,
      maxlength: 50
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    claimedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    resolvedAt: {
      type: Date
    },
    isUrgent: {
      type: Boolean,
      default: false
    },
    reward: {
      type: Number,
      min: 0
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
lostAndFoundSchema.index({ type: 1, status: 1, createdAt: -1 });
lostAndFoundSchema.index({ category: 1, status: 1 });
lostAndFoundSchema.index({ hostel: 1, block: 1 });
lostAndFoundSchema.index({ tags: 1 });
lostAndFoundSchema.index({ title: "text", description: "text", tags: "text" });
lostAndFoundSchema.index({ dateLostOrFound: -1 });

// Virtual to check if item is recently reported
lostAndFoundSchema.virtual('isRecent').get(function() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return this.createdAt > threeDaysAgo;
});

// Virtual to get days since reported
lostAndFoundSchema.virtual('daysSinceReported').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

export default mongoose.model("LostAndFound", lostAndFoundSchema);
