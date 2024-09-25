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
        products: [],
        cartTotal: 0,
        orderBy: userId,
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
        count,
        price: product.price,
        title: product.title,
        description: product.description,
        category: product.category,
        brand: product.brand,
        quantity: product.quantity,
        sold: product.sold,
        images: product.images,
        rating: product.rating,
        totalRating: product.totalRating,
      });
    }
    cart.cartTotal = cart.products.reduce(
      (total, product) => total + product.count * product.price,
      0
    );
    await cart.save();
    await cart.populate("products.productId");
    return res.status(200).json({
      success: true,
      message: "Product added to the cart successfully",
      cart,
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
      const updatedCount = cart.products[productIndex].count - count;

      if (updatedCount <= 0) {
        cart.products.pull({ _id: cart.products[productIndex]._id });
      } else {
        cart.products[productIndex].count = updatedCount;
      }

      cart.cartTotal = cart.products.reduce(
        (total, item) => total + item.count * item.price,
        0
      );

      await cart.save();
      await cart.populate("products.productId");

      return res.status(200).json({
        success: true,
        message: "Product updated/removed from the cart successfully",
        cart,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found in the cart",
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
    const userLogin = await User.findById(userId);
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "user does not exist",
      });
    }
    const userOrdersCart = await Cart.find({ orderBy: userLogin._id }).populate(
      "products.productId"
    );
    // const userOrdersCart = await Cart.find({}).populate("products.productId");
    console.log("userOrdersCart", userOrdersCart);
    if (!userOrdersCart) {
      res.status(400).json({
        success: true,
        message: "No product is available in cart",
      });
    }
    res.json({
      success: true,
      message: "All products in the cart",
      userOrdersCart,
    });
  } catch (error) {
    console.log(error);
  }
};
export { addToCart, removeCart, getAllCartItem };
