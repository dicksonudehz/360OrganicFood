import express from 'express'
import { allOrdersByLocDist, createOrder, fetchAllOrder, fetchSingleOrder, fulfilOrders, orderByDistributor, updateOrder, verifyOrder } from '../controller/orderController.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

orderRouter.post("/place",authMiddleware, createOrder);
orderRouter.get("/distributorOrders/",authMiddleware, orderByDistributor);
orderRouter.get("/fulfilOrders/",authMiddleware, fulfilOrders);
orderRouter.get("/all", authMiddleware, isAdmin, fetchAllOrder);
orderRouter.post("/verify", authMiddleware, isAdmin, verifyOrder);
orderRouter.get("/single/:id", authMiddleware, isAdmin, fetchSingleOrder);
orderRouter.put("/update/:id", authMiddleware, isAdmin, updateOrder);
orderRouter.get("/distLocation/", authMiddleware, allOrdersByLocDist);

export default orderRouter