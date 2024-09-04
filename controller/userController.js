import { generateTokens } from "../config/jwtTokens.js";
import User from "../models/userModel.js";
import { sendMail } from "./emailController.js";
import crypto from "crypto";

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
    const registerUser = await user.save();
    if (registerUser) {
      res.status(200).json({
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
    const userDistributor = user.role;
    if (userDistributor !== "Distributor") {
      res.status(400).json({
        success: false,
        message: "user must be a distributor",
      });
    }
    if (user && userDistributor) {
      user.role = "Distributor";
      await user.save();
      res.status(200).json({
        success: true,
        message: "you have register as a distributor",
        user,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "user must be a distributor",
      });
      rerturn;
    }
  } catch (error) {
    console.log(error);
  }
  res.status(400).json({
    success: false,
    message: "failed",
  });
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
    if (!blockDistributor) {
      res.status(400).json({
        success: false,
        message: "distributor does not exist",
      });
    } else {
      blockDistributor.isBlocked = "true";
    }
    res.status(200).json({
      success: true,
      message: "this distributor is block",
      blockDistributor,
    });
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

const distributorByLocation = async (req, res) => {
  const { userId } = req.body;
  try {
    const distributor = await User.findById(userId);
    if (distributor) {
      const distributorLocation = distributor.address;
      res.status(200).json({
        success: true,
        message: "distributor address",
        distributorLocation,
      });
    }
    console.log(distributor.address);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "error",
    });
  }
};

const loginUser = async (req, res) => {
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
      res.json({
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
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.json({
        success: false,
        message: "user cannot be found with this email",
      });
    } else {
      const tokenUser = await user.createPasswordResetToken();
      await user.save();
      const resetURL = `please follow this link to reset your password, this link last for 10 minutes <a href='http://localhost:8000/api/user/reset-password/${tokenUser}'>Click Here</a>`;
      const data = {
        to: email,
        subject: "forget password reset link",
        text: "hello user",
        html: resetURL,
      };
      sendMail(data);
      res.json(tokenUser);
    }
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  if (!token) {
    throw new Error("Token is undefined or null");
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $$gt: Date.now() },
  });
  if (!user) {
    res.json({
      success: false,
      message: "token expires",
    });
  }
  (user.password = password),
    (user.passwordResetToken = undefined),
    (user.passwordResetExpires = undefined);
  await user.save();
  res.json({
    success: true,
    message: "password reset",
    user,
  });
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
  deleteDistributor,
  distributorByLocation,
};
