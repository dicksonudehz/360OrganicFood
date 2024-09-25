import Cart from "../models/cartModel.js";
import orderModel from "../models/orderModel.js";
import User from "../models/userModel.js";
import axios from "axios";

const createOrder = async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  const { userId, address } = req.body;

  try {
    // Fetch cart and check if cart exists for the user
    const cart = await Cart.findOne({ orderBy: userId }).populate(
      "products.productId"
    );
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    // Fetch distributors and check if any distributor is available
    const distributors = await User.find({ role: "Distributor" });
    if (distributors.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No distributor available" });
    }

    // Prepare distributors array for the order
    const distributorData = distributors.map((distributor) => ({
      distributorId: distributor._id,
      firstname: distributor.firstname,
      lastname: distributor.lastname,
      email: distributor.email,
      mobile: distributor.mobile,
      role: distributor.role,
      address: distributor.address,
      isBlocked: distributor.isBlocked,
    }));

    // Product ordered by the user from cart
    const productOrdered = cart.products.map((item) => ({
      productId: item.productId,
      count: item.count,
      price: item.price,
      title: item.title,
      description: item.description,
      category: item.category,
      brand: item.brand,
      quantity: item.quantity,
      images: item.images,
      rating: item.rating,
      totalRating: item.totalRating,
    }));
    // Calculate total amount
    const totalAmount = cart.products.reduce(
      (sum, product) => sum + product.price * product.count,
      0
    );
    // Create a new order
    const newOrder = new orderModel({
      userId,
      products: productOrdered,
      orderTotal: totalAmount,
      orderStatus: "Processing",
      address: address,
      payment: true,
      Distributor: distributorData,
    });

    // Save the new order
    await newOrder.save();

    // Clear the user's cart after placing the order
    await Cart.findOneAndUpdate(
      { orderBy: userId },
      { $set: { products: [] } }
    );

    // Fetch user email for payment
    const user = await User.findById(userId);
    const email = user.email;

    // Initialize payment with Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: totalAmount * 100, // Convert to cents/kobo
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

    // Respond with the Paystack authorization URL
    res.json({
      success: true,
      message: "Payment initialized successfully",
      authorization_url: response.data.data.authorization_url,
    });
  } catch (error) {
    console.error(error);
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

const allOrdersByLocDist = async (req, res) => {
  const { address } = req.body;
  try {
    // console.log(userId);
    const allOrders = await orderModel.find({});

    const filteredDistributors = allOrders.map((order) => {
      return order.Distributor.filter((dist) => dist.address === address);
    });

    const result = filteredDistributors.flat();
    if (result.length === 0) {
      res.status(400).json({
        success: false,
        message: "no distributor with the above address",
      });
    }
    console.log("filteredDistributors", filteredDistributors);

    if (filteredDistributors) {
      res.status(200).json({
        success: true,
        message: "all orders by this users according to the location entered",
        filteredDistributors,
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
  allOrdersByLocDist,
};
