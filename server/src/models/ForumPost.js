import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    upvotes: {
      type: Number,
      default: 0
    },

    downvotes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("ForumPost", forumPostSchema);
