import express from 'express'
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { addToCart, getAllCartItem, removeCart } from '../controller/cartController.js';

const cartRouter = express.Router();

cartRouter.post("/addToCart", addToCart);
cartRouter.post("/remove",authMiddleware, removeCart);
cartRouter.get("/allCartItems",authMiddleware, getAllCartItem);



export default cartRouter