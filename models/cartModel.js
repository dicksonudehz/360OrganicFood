import mongoose from "mongoose";

var cartSchema = new mongoose.Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "productModel",
        },
        count: Number,
        price: Number,
        date: { type: Date, default: Date.now },
      },
    ],
    cartTotal: Number,
    totalAfterDiscount: Number,
    orderStatus: {
      type: String,
      enum: [
        "Not Processed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Not Processed",
    },
    orderBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
