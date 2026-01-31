import mongoose from "mongoose";

const issueLogSchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    required: true
  },

  fromStatus: String,
  toStatus: String,

  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  remarks: String,

  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("IssueLog", issueLogSchema);
