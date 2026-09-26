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
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [72, "Password cannot exceed 72 characters"],
      select: false,
    },
  },
  { timestamps: true }
);


// Never expose the password hash, no matter who serializes the document
AdminSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});


// Password hashing
AdminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcryptjs.genSalt(10);

  this.password = await bcryptjs.hash(this.password, salt);
});


// Compare password
AdminSchema.methods.comparePassword = async function (password) {
  if (!this.password) {
    throw new Error(
      "Password hash is not loaded. Query with .select('+password') to compare passwords."
    );
  }

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