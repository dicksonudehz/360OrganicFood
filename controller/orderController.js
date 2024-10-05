import Cart from "../models/cartModel.js";
import orderModel from "../models/orderModel.js";
import User from "../models/userModel.js";
import axios from "axios";

const createOrder = async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  const { userId, location, address, distEmail } = req.body;

  try {
    const cart = await Cart.findOne({ orderBy: userId }).populate(
      "products.productId"
    );
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    const userExist = await User.findOne({ email: distEmail });
    if (!userExist) {
      return res.status(400).json({
        success: false,
        message: "not a registered user",
      });
    }
    const distributors = await User.find({ role: "Distributor" });
    const selectedDistributor = distributors.filter((singleDis) => {
      return singleDis._id.equals(userExist._id);
    });
    if (!selectedDistributor) {
      return res.status(400).json({
        success: false,
        message: "select a distributor closest to you",
      });
    }
    const distLocation = selectedDistributor[0].location;
    if (!distLocation) {
      return res.status(400).json({
        success: false,
        message: "select valid distributor location",
      });
    }
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
    const totalAmount = cart.products.reduce(
      (sum, product) => sum + product.price * product.count,
      0
    );
    const newOrder = new orderModel({
      userId,
      products: productOrdered,
      orderTotal: totalAmount,
      orderStatus: "Processing",
      location: distLocation,
      address: address,
      payment: true,
      Distributor: selectedDistributor,
    });
    await newOrder.save();
    await Cart.findOneAndUpdate(
      { orderBy: userId },
      { $set: { products: [] } }
    );

    // Fetch user email for payment
    const user = await User.findById(userId);
    const email = user.email;
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

    return res.json({
      success: true,
      message: "Payment initialized successfully",
      authorization_url: response.data.data.authorization_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Payment initialization failed",
    });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  // const { orderId, success } = req.params;
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
  const { location } = req.body;
  try {
    const allOrders = await orderModel.find({});
    const filteredDistributors = allOrders.map((order) => {
      return order.Distributor.filter((dist) => dist.location === location);
    });
    const result = filteredDistributors.flat();
    if (result.length === 0) {
      res.status(400).json({
        success: false,
        message: "no distributor with the above location",
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

const allOrdersByDistr = async (req, res) => {
  try {
    const userExist = req.user;
    if (!userExist) {
      res.status(400).json({
        success: false,
        message: "no user with this email address",
      });
    }
    if (userExist) {
      const allOrders = await orderModel.find({});
      const filteredDistributors = allOrders.map((order) => {
        return order.Distributor.filter((dist) =>
          dist._id.equals(userExist._id)
        );
      });

      const distributorOrders = allOrders.filter((order) => {
        return order.Distributor.some((dist) => dist._id.equals(userExist._id));
      });

      const result = distributorOrders.flat();
      if (result.length === 0) {
        return res.status(400).json({
          success: false,
          message: "no user place orders in your region",
        });
      }
      if (distributorOrders) {
        return res.status(200).json({
          success: true,
          message: "All the orders from your users",
          distributorOrders,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "failed",
    });
  }
};

const distFulfilOrders = async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;
  try {
    // check who sign in
    const user = req.user;
    if (user.role === "Distributor") {
      const orderExist = await orderModel.findById(id);
      if (!orderExist) {
        res.status(400).json({
          success: false,
          message: "No order exist with this ID",
        });
      }
      if (orderExist) {
        const fulfilSingularOrder = await orderModel.findByIdAndUpdate(
          id,
          { orderStatus: orderStatus },
          { new: true }
        );
        res.status(200).json({
          success: true,
          message: "role updated successfully",
          fulfilSingularOrder,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "failed",
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
  allOrdersByDistr,
  distFulfilOrders,
};
