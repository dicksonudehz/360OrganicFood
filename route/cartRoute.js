import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addToCart,
  getAllCartItem,
  removeCart,
} from "../controller/cartController.js";

const cartRouter = express.Router();

cartRouter.post("/addToCart", addToCart);
cartRouter.post("/remove", removeCart);
cartRouter.get("/allCartItems", authMiddleware, getAllCartItem);

export default cartRouter;
