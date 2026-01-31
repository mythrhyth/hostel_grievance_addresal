import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    hostel: String,

    month: {
      type: String,
      required: true
    },

    components: {
      rent: Number,
      electricity: Number,
      water: Number,
      mess: Number,
      fine: Number
    },

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["PAID", "UNPAID"],
      default: "UNPAID"
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);
