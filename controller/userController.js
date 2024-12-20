import { generateTokens } from "../config/jwtTokens.js";
import Cart from "../models/cartModel.js";
import productModel from "../models/productModel.js";
import User from "../models/userModel.js";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import randomstring from "randomstring";
import sendMail from "../utils/sendMail.js";
import dotenv from "dotenv";

dotenv.config();

const registerUser = async (req, res) => {
  try {
    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
      role: req.body.role,
      address: req.body.address,
    });
    const userExists = await User.findOne({ email: user.email });
    if (userExists) {
      res.status(400).json({
        success: false,
        message: "user already exist",
      });
    }
    const registerUser = await user.save();
    if (registerUser) {
      res.status(200).json({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        mobile: user.mobile,
        password: user.password,
        role: user.role,
        address: user.address,
        token: generateTokens(user._id),
        success: true,
        message: "user registration successful",
        user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "failed",
    });
  }
};

const createDistributor = async (req, res) => {
  const uniqueNumber = Math.floor(100000 + Math.random() * 900000);
  try {
    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
      role: req.body.role,
      address: req.body.address,
      location: req.body.location,
      distributorNumber: uniqueNumber,
    });
    const userExists = await User.findOne({ email: user.email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "user already exist",
      });
    }
    const userMobile = await User.findOne({ mobile: user.mobile });
    if (userMobile) {
      return res.status(400).json({
        success: false,
        message: "phone number already taken",
      });
    }
    if (user.role === "Distributor") {
      await user.save();
      return res.status(200).json({
        success: true,
        message: "distributor registered successfully",
        user,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "user must be a distributor",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "failed",
    });
  }
};

const fetchAlldistributor = async (req, res) => {
  try {
    const distributors = await User.find({ role: "Distributor" });
    if (distributors) {
      res.status(200).json({
        success: true,
        message: "All available distributors",
        distributors,
      });
    } else {
      res.status(400).json({
        success: true,
        message: "no distributor available",
        distributors,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: true,
      message: "error",
    });
  }
};

const getSingleDistributor = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        success: true,
        message: "user does not exist",
      });
    }
    const distributor = user.role;
    if (distributor === "Distributor") {
      res.status(200).json({
        success: true,
        message: "Distributor with the above email address",
        user,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "error",
    });
  }
};

const blockDistributor = async (req, res) => {
  const { userId } = req.body;
  try {
    const blockDistributor = await User.findById(userId);

    if (blockDistributor.role !== "Distributor") {
      res.status(400).json({
        success: false,
        message: "user is not a distributor",
      });
    } else {
      const distBlock = await User.findByIdAndUpdate(
        userId,
        { isBlocked: true },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "this distributor is block",
        distBlock,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "error",
    });
  }
};
const unblockblockDistributor = async (req, res) => {
  const { userId } = req.body;
  try {
    const blockDistributor = await User.findById(userId);

    if (blockDistributor.role !== "Distributor") {
      res.status(400).json({
        success: false,
        message: "user is not a distributor",
      });
    } else {
      const distUnblock = await User.findByIdAndUpdate(
        userId,
        { isBlocked: false },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "this distributor is block",
        distUnblock,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "error",
    });
  }
};

const deleteDistributor = async (req, res) => {
  const { id } = req.params;
  try {
    const distributor = await User.findById(id);
    if (!distributor) {
      res.status(400).json({
        success: false,
        message: "distributor does not exist",
      });
    }
    if (distributor.role === "Distributor") {
      const deletedDistributor = await User.findByIdAndDelete(id);
      console.log("deleteDistributor", deleteDistributor);
      res.status(200).json({
        success: true,
        message: "distributor deleted successfully",
        deletedDistributor,
      });
    } else if (distributor.role !== "Distributor") {
      res.status(400).json({
        success: false,
        message: "user is not a distributor",
        distributor,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "error occur when deleting distributor",
    });
  }
};

const allDistributorByLocation = async (req, res) => {
  try {
    const allDistributors = await User.find({ role: "Distributor" });
    if (allDistributors) {
      const allDistAddress = allDistributors.map(
        (distributor) => distributor.location
      );
      res.status(200).json({
        success: true,
        message: "distributor's location",
        allDistAddress,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "error",
    });
  }
};

const distributorMostSaleProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({
        success: false,
        message: "user does not exist",
      });
    }
    const distributor = user.role;
    if (distributor === "Distributor") {
      const userOrdersCart = await Cart.find({ orderBy: id });
      const allProduct = userOrdersCart.flatMap((cart) => cart.products);
      if (!allProduct) {
        res.status(200).json({
          success: true,
          message: "no product is added to the cart",
        });
      }

      const maxCount = Math.max(...allProduct.map((product) => product.count));

      const productsWithMaxCount = allProduct.filter(
        (product) => product.count === maxCount
      );

      res.status(200).json({
        success: true,
        message: "this are the product with the higher buying power",
        productsWithMaxCount,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "failed",
    });
  }
};

const filterProdPuchaseByDate = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({
        success: false,
        message: "user does not exist",
      });
    }
    const distributor = user.role;
    if (distributor === "Distributor") {
      const userOrdersCart = await Cart.find({ orderBy: id });
      const allProduct = userOrdersCart.flatMap((cart) => cart.products);
      if (allProduct.length > 0) {
        const sortProductByDate = allProduct.sort(
          (firstProd, secondProd) =>
            new Date(secondProd.date) - new Date(firstProd.date)
        );
        const dateOfPurchase = sortProductByDate.date;
        console.log("dateOfPurchase", dateOfPurchase);
        res.status(200).json({
          success: true,
          message: "All Product purchase by date",
          sortProductByDate,
          dateOfPurchase,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "This distributor have not bought any product",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "User is not a distributor",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error",
    });
  }
};

const loginUser = async (req, res) => {
  const user = req.user;
  console.log(user);
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      res.status(400).json({
        success: false,
        message: "user does not exist",
      });
    }
    if (findUser && (await findUser.isPasswordMatched(password))) {
      const refreshToken = generateTokens(findUser._id);
      // const token = createToken(findUser._id);
      // const updateUser = await User.findByIdAndUpdate(
      //   findUser._id,
      //   { token },
      //   {
      //     new: true,
      //   }
      // );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000, // 3 days
      });
      res.status(200).json({
        success: true,
        message: "user details",
        // updateUser,
        findUser,
        refreshToken,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "user email and password does not match",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "failed to login",
    });
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email });
    const adminLogin = findUser.role === "admin";
    if (!adminLogin) {
      res.status(400).json({
        success: false,
        message: "user not authorize, you are not an admnin",
      });
    }

    if (adminLogin && (await findUser.isPasswordMatched(password))) {
      const refreshToken = generateTokens(findUser._id);
      const updateUser = await User.findByIdAndUpdate(
        findUser._id,
        { refreshToken },
        {
          new: true,
        }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000, // 3 days
      });
      res.status(400).json({
        success: true,
        message: "admin user details",
        updateUser,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "user email and password does not match",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "failed",
    });
  }
};

const allUser = async (req, res) => {
  try {
    const users = await User.find({});
    if (users) {
      res.status(200).json({
        success: true,
        message: "available users registered",
        users,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getAUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      res.json({
        success: false,
        message: "user not found",
      });
    } else {
      res.json({
        success: true,
        message: "available user",
        user,
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

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    if (deleteUser) {
      res.json({
        success: true,
        message: "user deleted",
        deleteUser,
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

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ sucess: false, message: "User doesn't exist" });
    }
    const otp2 = randomstring.generate({
      length: 6,
      charset: "numeric",
    });

    // convert otp to string
    const otpString = otp2.toString();
    const salt = await bcryptjs.genSalt(10);
    const hashedOtp = await bcryptjs.hash(otpString, salt);

    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const updateotp = await User.findByIdAndUpdate(
      user._id,
      { otp: hashedOtp, otpExpiresAt },
      { new: true, useFindAndModify: false }
    );
    await user.save();
    const emailContent = `
      Hello ${user.firstname},
      Your OTP for password reset is: <strong>${otp2}</strong>
      This OTP is valid for 10 minutes.
    `;
    const emailData = {
      to: user.email,
      subject: "Password Reset OTP",
      text: emailContent,
    };

    await sendMail({ body: emailData }, res);
    // return res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ message: "An error occurred while processing the request" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    console.log(user);
    if (!user) {
      res.status(400).json({
        success: false,
        message: "user not found",
      });
    } else {
      const newPass = await bcryptjs.hash(password, 10);
      const updatePass = await User.findByIdAndUpdate(
        user._id,
        { password: newPass },
        { new: true, useFindAndModify: false }
      );
      if (updatePass) {
        return res.status(200).json({
          success: true,
          message: "password reset successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "unable to reset the password",
        });
      }
    }
  } catch (err) {
    throw new Error(err);
  }
};

const verifyOTP = async (req, res) => {
  const { otp, email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    const decoded = bcryptjs.compare(otp, user.otp);
    if (decoded && user.otpExpiresAt > new Date()) {
      res.status(200).json({
        success: true,
        message: "OTP is verified",
      });
    } else if (user.otpExpiresAt <= new Date()) {
      res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "OTP is invalid",
      });
    }
  } catch (err) {
    throw new Error(err);
  }
};

const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findById(id);
    if (!password) {
      res.status(400).json({
        success: false,
        message: "enter new password",
      });
    } else {
      user.password = password;
      const updatedPassword = await user.save();
      res.status(200).json({
        success: true,
        message: "password updated successfully",
        updatedPassword,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: true, message: "error" });
  }
};

const updatedRole = async (req, res) => {
  const { userId, email, role } = req.body;
  try {
    const emailExist = await User.findOne({ email: email });
    if (!emailExist) {
      res.status(400).json({
        success: false,
        message: "no user with this email",
      });
    }
    const userAdmin = await User.findOne({ emailExist, role: "admin" });
    if (emailExist && userAdmin) {
      res.status(400).json({
        success: false,
        message: "user must not be an admin",
      });
    } else if (emailExist && !emailExist.role) {
      res.status(400).json({
        success: false,
        message: "user must have a role",
      });
    }
    // asign role to a user
    const user = await User.findByIdAndUpdate(
      emailExist,
      { role: role },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "role updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: "error" });
  }
};

export {
  registerUser,
  loginUser,
  loginAdmin,
  allUser,
  getAUser,
  deleteUser,
  forgetPassword,
  resetPassword,
  updatePassword,
  createDistributor,
  fetchAlldistributor,
  getSingleDistributor,
  blockDistributor,
  unblockblockDistributor,
  deleteDistributor,
  allDistributorByLocation,
  distributorMostSaleProduct,
  filterProdPuchaseByDate,
  updatedRole,
  verifyOTP,
};
