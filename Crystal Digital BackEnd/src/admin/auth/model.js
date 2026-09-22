import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    role: {
      type: String,
      required: true,
      default: "admin",
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [4, "Password must be at least 4 characters"],
      maxlength: [20, "Password cannot exceed 20 characters"],
    },
  },
  { timestamps: true }
);


// Password hashing
AdminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcryptjs.genSalt(10);

  this.password = await bcryptjs.hash(this.password, salt);

  
});


// Compare password
AdminSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};


// Generate JWT
AdminSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRE,
    }
  );
};


export const AdminModel = mongoose.model("admin", AdminSchema);