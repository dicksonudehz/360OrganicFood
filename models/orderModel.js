import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // userId: { type: String, required: true },
    // items: { type: Array, required: true },
    // // products: { type: Array, required: true },
    // amount: { type: Number, required: true },
    // address: { type: Object, required: true },
    // status: { type: String, default: "food Processing" },
    // Date: { type: Date, default: Date.now() },
    // payment: { type: Boolean, default: false },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        count: Number,
        price: Number,
      },
    ],
    orderTotal: { type: Number, required: true },
    orderStatus: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now },
    address: { type: Object, required: true },
    status: { type: String, default: "food Processing" },
    payment: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
