import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productModel",
      },
      count: Number,
      price: Number,
    }, 
  ],
  cartTotal: Number,
  totalAfterDiscount: Number,
  orderStatus: {
    type: String,
    enum: ["Not Processed", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Not Processed",
  },
  orderBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

//Export the model
const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
