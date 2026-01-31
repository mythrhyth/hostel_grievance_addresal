import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reactions: [{
      type: {
        type: String,
        enum: ["like", "helpful", "urgent"],
        required: true
      },
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }]
    }],
    isInternal: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for efficient queries
commentSchema.index({ issueId: 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);
