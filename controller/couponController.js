import Coupon from "../models/couponModel.js";

const createCoupon = async (req, res) => {
  try {
    const { name, expiry, discount } = req.body;
    const createCoupon = new Coupon({
      name,
      expiry,
      discount,
    });
    await createCoupon.save();
    res.json({
      success: true,
      message: "coupon created successfully",
      createCoupon,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "failed",
    });
  }
};

const allCoupon = async (req, res) => {
  try {
    const availableCoupons = await Coupon.find({});
    res.json({
      success: true,
      message: "available coupon",
      availableCoupons,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "no coupon available",
      availableCoupons,
    });
  }
};

const singleCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const singleCoupon = await Coupon.findById(id);
    if (!singleCoupon) {
      res.json({
        success: false,
        message: "no coupon with this id",
      });
    } else {
      res.json({
        success: true,
        message: "available coupon",
        singleCoupon,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "failed",
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const removeCoupon = await Coupon.findByIdAndDelete(id);
    if (!removeCoupon) {
      res.json({
        success: false,
        message: "no coupon exist",
      });
    } else {
      res.json({
        success: true,
        message: "coupon deleted succesfully",
        removeCoupon,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "failed",
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!update) {
      res.json({
        success: false,
        message: "coupon failed to update",
      });
    } else {
      res.json({
        success: true,
        message: "coupon updated succesfully",
        update,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "failed",
    });
  }
};
export { createCoupon, allCoupon, singleCoupon, deleteCoupon, updateCoupon };
