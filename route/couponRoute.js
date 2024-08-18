import express from 'express'
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import { allCoupon, createCoupon, deleteCoupon, singleCoupon, updateCoupon } from '../controller/couponController.js';

const couponRouter = express.Router();

couponRouter.post("/create",authMiddleware, isAdmin, createCoupon);
couponRouter.get("/allCoupon",authMiddleware, isAdmin, allCoupon);
couponRouter.get("/singleCodupon/:id",authMiddleware, isAdmin, singleCoupon);
couponRouter.delete("/delete/:id",authMiddleware, isAdmin, deleteCoupon);
couponRouter.put("/update/:id",authMiddleware, isAdmin, updateCoupon);




export default couponRouter