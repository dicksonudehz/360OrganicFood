import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    products: [],
    orderTotal: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["Processing", "Delivered", "Cancelled"],
      default: "Processing",
    },
    location: { type: String },
    address: { type: String, required: true },
    payment: { type: Boolean, default: false },
    Distributor: { type: Array, required: true },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("OrderModel", orderSchema);

export default OrderModel;
