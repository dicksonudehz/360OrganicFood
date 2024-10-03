import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        if (!user) {
          res.status(400).json({
            success: false,
            message: "No user found",
          });
        }
        req.user = user;
        req.body._id = decoded?.id;
        next();
      } else {
        res.status(400).json({
          success: false,
          message: "token is invalid",
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Not authorize token expired, please login again",
      });
    }
  } else {
    throw new Error("There is no token attached to header");
  }
};

const isAdmin = async (req, res, next) => {
  const { role } = req.user;
  try {
    if (role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You are not authorized as admin",
      });
    } else {
      next();
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Server error while verifying admin" });
  }
};

export { authMiddleware, isAdmin };
