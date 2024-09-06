import Cart from "../models/cartModel.js";
import productModel from "../models/productModel.js";
import User from "../models/userModel.js";

const addToCart = async (req, res) => {
  const { userId, productId, count } = req.body;
  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }
    let cart = await Cart.findOne({ orderBy: userId });
    if (!cart) {
      cart = new Cart({
        orderBy: userId,
        products: [],
        cartTotal: 0,
      });
    }
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex > -1) {
      cart.products[productIndex].count += count;
    } else {
      cart.products.push({
        productId,
        product,
        count,
        price: product.price, 
      });
    }
    cart.cartTotal = cart.products.reduce(
      (total, product) => total + product.count * product.price,
      0
    );
    await cart.save();
    const productCart = cart.products
    return res.status(200).json({
      success: true,
      message: "Product added to the cart successfully",
      cart,
      message:"product that is been added to the cart",
      productCart
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const removeCart = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.body.userId });
    if (!userData) {
      res.json({
        success: true,
        message: "no user found",
      });
    }
    let cartData = await userData.cartData;
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;
    }
    await User.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({
      success: true,
      message: "product remove from the cart successfully",
      cartData,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllCartItem = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.body.userId });
    if (!userData) {
      res.json({
        success: true,
        message: "no user found",
      });
    }
    let cartData = await userData.cartData;
    res.json({
      success: true,
      message: "all items in the cart",
      cartData,
    });
  } catch (error) {
    console.log(error);
  }
};

export { addToCart, removeCart, getAllCartItem };
