import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["STUDENT", "CARETAKER", "MANAGEMENT"],
      required: true,
      default: "STUDENT"
    },

    // STUDENT ONLY
    hostel: {
      type: String,
      required: function () {
        return this.role === "STUDENT";
      }
    },

    block: {
      type: String,
      required: function () {
        return this.role === "STUDENT";
      }
    },

    room: {
      type: String,
      required: function () {
        return this.role === "STUDENT";
      }
    },

    phone: {
      type: String,
      required: false,
      trim: true,
      maxlength: 20
    },

    // CARETAKER & MANAGEMENT
    hostels: {
      type: [String],
      required: function () {
        return this.role === "CARETAKER" || this.role === "MANAGEMENT";
      },
      validate: {
        validator: function (v) {
          if (this.role === "STUDENT") return true;
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one hostel must be assigned"
      }
    }
  },
  { timestamps: true }
);

// 🔐 Hash password
userSchema.pre("save", async function () {
  // If password wasn't modified, do nothing
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 Compare password
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
