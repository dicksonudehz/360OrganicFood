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
        title: String,
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
    cartTotal: Number,
    totalAfterDiscount: Number,
    orderStatus: {
      type: String,
      enum: ["Not Processed", "Processing", "Delivered", "Cancelled"],
      default: "Processing",
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
