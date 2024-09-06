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
    const productCart = cart.products;
    return res.status(200).json({
      success: true,
      message: "Product added to the cart successfully",
      cart,
      message: "product that is been added to the cart",
      productCart,
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
      return res.status(404).json({
        success: false,
        message: "No cart found for this user",
      });
    }
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex > -1) {
      if (count <= 0) {
        cart.products.pull({ _id: cart.products[productIndex]._id });
      } else {
        cart.products[productIndex].count = count;
      }

      cart.cartTotal = cart.products.reduce(
        (total, item) => total + item.count * item.price,
        0
      );

      await cart.save();

      // Send back updated cart info
      return res.status(200).json({
        success: true,
        message: "Product updated in the cart successfully",
        cart,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllCartItem = async (req, res) => {
  const { userId } = req.body;
  try {
    const userData = await User.findById({ _id: req.body.userId });
    if (!userData) {
      res.json({
        success: true,
        message: "no user found",
      });
    }
    let cart = await Cart.findOne({ orderBy: userId });
    let allProducts = cart.products;
    res.json({
      success: true,
      message: "All products in the cart",
      allProducts,
    });
  } catch (error) {
    console.log(error);
  }
};

export { addToCart, removeCart, getAllCartItem };
