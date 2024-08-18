import express from 'express'
import { createOrder, fetchAllOrder, fetchSingleOrder, updateOrder, verifyOrder } from '../controller/orderController.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

orderRouter.post("/place",authMiddleware, createOrder);
orderRouter.get("/all", authMiddleware, isAdmin, fetchAllOrder);
orderRouter.post("/verify", authMiddleware, isAdmin, verifyOrder);
orderRouter.get("/single/:id", authMiddleware, isAdmin, fetchSingleOrder);
orderRouter.put("/update/:id", authMiddleware, isAdmin, updateOrder);


export default orderRouter