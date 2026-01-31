import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100
        },
        votes: { type: Number, default: 0 },
        voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Track who voted for this option
      }
    ],

    targetHostels: [{
      type: String,
      required: true
    }],

    targetRoles: [{
      type: String,
      enum: ["student", "caretaker", "management"]
    }],

    isActive: {
      type: Boolean,
      default: true
    },

    expiresAt: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Track all voters to prevent duplicate voting
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

// Virtual to check if poll is expired
pollSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual to get total votes
pollSchema.virtual('totalVotes').get(function() {
  return this.options.reduce((total, option) => total + option.votes, 0);
});

// Index for efficient queries
pollSchema.index({ createdAt: -1 });
pollSchema.index({ targetHostels: 1 });
pollSchema.index({ targetRoles: 1 });
pollSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
pollSchema.index({ isActive: 1 });

export default mongoose.model("Poll", pollSchema);
