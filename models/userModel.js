import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: { type: String },
    otpExpiresAt: Date,
    role: {
      type: String,
      default: "user",
    },
    address: {
      type: String,
    },
    // orders:[],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // cartData: { type: Object, default: {} },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "cartModel" }],
    // wishList: [{ type: mongoose.Schema.Types.ObjectId, ref: "productModel" }],
    wishList: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        title: String,
        price: Number,
        description: String,
        category: String,
        brand: String,
        quantity: Number,
        sold: Number,
        images: [],
        rating: [],
        totalRating: String,
      },
    ],

    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timeStamp: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPasswordMatched = async function (enteredPasspword) {
  return await bcrypt.compare(enteredPasspword, this.password);
};
userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("user", userSchema);

export default User;
