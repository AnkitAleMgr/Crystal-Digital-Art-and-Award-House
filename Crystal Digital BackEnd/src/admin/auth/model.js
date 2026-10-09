import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin/staff accounts. Two invariants are load-bearing: the hash is never
// selected by default (`select: false` + the toJSON transform), and every
// password comparison has to opt it back in with `.select("+password")`.
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
      enum: ["admin", "staff"],
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


// Belt and braces on top of `select: false`: even a document that was explicitly
// selected (or serialized by some other code path) never hands out the hash.
AdminSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});


// Hashes only when the password actually changed, so an unrelated edit (a name,
// a role) cannot run the stored hash through bcrypt a second time.
AdminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcryptjs.genSalt(10);

  this.password = await bcryptjs.hash(this.password, salt);
});


// Throws when the hash was not loaded rather than silently answering false —
// callers must query with .select("+password").
AdminSchema.methods.comparePassword = async function (password) {
  if (!this.password) {
    throw new Error(
      "Password hash is not loaded. Query with .select('+password') to compare passwords."
    );
  }

  return await bcryptjs.compare(password, this.password);
};


// Payload is { id, email, role }: authMiddleware looks decoded.id up in the
// admins collection, which is why a subscriber link token (email + purpose)
// fails every protected route even when signed with the same secret.
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