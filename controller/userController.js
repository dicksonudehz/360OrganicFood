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
    if (user) {
      await user.save();
      res.json({
        success: true,
        message: "user registration successful",
        user,
      });
    } else {
      res.json({
        success: false,
        message: "cannot register a user",
      });
    }
  } catch (error) {
    console.log(error);
  }
  res.json({
    success: false,
    message: "failed",
  });
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
        refreshToken
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
    const adminLogin = findUser.role === "isAdmin";
    if (!adminLogin)
      [
        res.json({
          success: false,
          message: "user not authorize",
        }),
      ];
    if (adminLogin && (await findUser.isPasswordMatched(password))) {
      const refreshToken = await generateTokens(findUser._id);
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
      res.json({
        success: true,
        message: "admin user details",
        updateUser,
      });
    } else {
      res.json({
        success: false,
        message: "user email and password does not match",
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
  updatePassword
};
