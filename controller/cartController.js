import User from "../models/userModel.js";

const addToCart = async (req, res) => {

  try {

      const userData = await User.findOne({ _id: req.body.userId});
      if (!userData) {
        res.json({
          success: false,
          message: "no user found",
        });
      }
    
    let cartData = await userData.cartData;
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }
    await User.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({
      success: true,
      message: "product add to cart successfully",
      cartData,
    });
  } catch (error) {
    console.log(error);
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
      message: "all items added to the cart",
      cartData,
    });
  } catch (error) {
    console.log(error);
  }
};

export { addToCart, removeCart, getAllCartItem };
