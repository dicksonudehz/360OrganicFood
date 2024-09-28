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
        req.user = user;
        req.body.userId = decoded?.id;
        next();
      }
    } catch (error) {
      throw new Error("Not authorize token expired, please login again");
    }
  } else {
    throw new Error("There is no token attached to header");
  }
};

const isAdmin = async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("you are not an admin");
  } else {
    next();
  }
};


export { authMiddleware, isAdmin };
