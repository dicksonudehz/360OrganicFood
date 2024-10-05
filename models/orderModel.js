import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure userId is required
    },
    products: [],
    orderTotal: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["Processing", "Delivered", "Cancelled"],
      default: "Processing",
    },
    location: { type: String, required: true },
    address: { type: String, required: true },
    payment: { type: Boolean, default: false },
    Distributor: { type: Array, required: true },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("OrderModel", orderSchema);

export default OrderModel;
