import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure userId is required
    },
    // products: [
    //   {
    //     product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    //     count: Number,
    //     price: Number,

    //     title: String,
    //     description: String,
    //     category: String,
    //     brand: String,
    //     quantity: Number,
    //     sold: Number,
    //     images: [],
    //     rating: [],
    //     totalRating: String,
    //   },
    // ],

    products: [],
    orderTotal: { type: Number, required: true },
    // orderStatus: { type: String, default: "Pending" },
    orderStatus: {
      type: String,
      enum: ["Processing", "Delivered", "Cancelled"],
      default: "Processing",
    },
    // createdAt: { type: Date, default: Date.now },
    address: { type: Object, required: true },
    payment: { type: Boolean, default: false },
    Distributor: { type: Array, required: true },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("OrderModel", orderSchema);

export default OrderModel;
