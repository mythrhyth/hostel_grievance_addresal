import mongoose from "mongoose";

const forumReplySchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
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

export default mongoose.model("ForumReply", forumReplySchema);
