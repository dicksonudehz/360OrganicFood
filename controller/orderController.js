import Cart from "../models/cartModel.js";
import orderModel from "../models/orderModel.js";
import User from "../models/userModel.js";
import axios from "axios";

const createOrder = async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  const { userId } = req.body;

  try {
    // Create a new order in the database
    // const newOrder = new orderModel({
    //   userId: req.body.userId,
    //   products: req.body.products,
    //   amount: req.body.amount,
    //   address: req.body.address,
    // });
    // await newOrder.save();
    const cart = await Cart.findOne({ orderBy: userId }).populate(
      "products.productId"
    );

    if (!cart) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Create an order using cart details
    const newOrder = new orderModel({
      user: userId,
      products: cart.products.map((item) => ({
        product: item.productId,
        count: item.count,
        price: item.price,
      })),
      orderTotal: cart.cartTotal,
    });
    // Clear the user's cart products
    await User.findByIdAndUpdate(req.body.userId, { products: [] });
    // Calculate the total amount in cents (USD) or kobo (NGN)

    const totalAmount = cart.products.reduce(
      (sum, product) => sum + product.price * product.count,
      0
    );
    console.log("totalAmount", totalAmount);
    // const totalAmount =
    // cart.products.reduce(
    //   (sum, product) => sum + product.price * product.count,
    //   0
    // ) + 2;
    // const amountInCents = totalAmount * 100;

    const user = await User.findById(req.body.userId);
    const email = user.email;

    // Initialize payment with Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email,
        amount: totalAmount,
        metadata: {
          orderId: newOrder._id,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: newOrder._id.toString(),
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Respond with the authorization URL from Paystack
    res.json({
      success: true,
      message: "Payment initialized successfully",
      authorization_url: response.data.data.authorization_url,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Payment initialization failed",
    });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === true) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({
        success: true,
        message: " paid",
      });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "not paid" });
    }
  } catch (error) {
    console.log(error);
  }
};

const fetchAllOrder = async (req, res) => {
  try {
    const allOrder = await orderModel.find({});
    res.json({
      success: true,
      message: " all available orders",
      allOrder,
    });
  } catch (error) {
    console.log(error);
  }
};

const fetchSingleOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const singleOrder = await orderModel.findById(id);
    res.json({
      success: true,
      message: " all available orders",
      singleOrder,
    });
  } catch (error) {
    console.log(error);
  }
};
const updateOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const updateOrder = await orderModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({
      success: true,
      message: " order updated successfully",
      updateOrder,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "failed",
    });
  }
};

const orderByDistributor = async (req, res) => {
  const { userId } = req.params;
  try {
    const distributor = await User.findById(userId);
    const allOrders = await orderModel.find({ userId: distributor._id });
    if (allOrders) {
      if (allOrders) {
        res.status(200).json({
          success: true,
          message: "This distributor has made following orders",
          allOrders,
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Distributor has no order",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "error",
    });
  }
};

const fulfilOrders = async (req, res) => {
  try {
    const fulfilOrders = await orderModel.find({ payment: "true" });
    console.log("fulfilOrders", fulfilOrders);
    if (fulfilOrders) {
      res.status(200).json({
        success: true,
        message: "all fulfil orders available",
        fulfilOrders,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "error",
    });
  }
};

export {
  verifyOrder,
  fetchAllOrder,
  createOrder,
  fetchSingleOrder,
  updateOrder,
  orderByDistributor,
  fulfilOrders,
};
