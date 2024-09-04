import express from 'express'
import {allUser, blockDistributor, createDistributor, deleteDistributor, deleteUser, distributorByLocation, fetchAlldistributor, forgetPassword, getAUser, getSingleDistributor, loginAdmin, loginUser, registerUser, resetPassword, updatePassword } from '../controller/userController.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/disRegister", createDistributor);
userRouter.get("/distributor", authMiddleware, isAdmin, fetchAlldistributor);
userRouter.get("/singleDistributor", authMiddleware, isAdmin, getSingleDistributor);
userRouter.post("/blockDistributor", authMiddleware, isAdmin, blockDistributor);
userRouter.delete("/deleteDistributor/:id", authMiddleware,isAdmin, deleteDistributor);
userRouter.get("/distributorLocation/", authMiddleware,isAdmin, distributorByLocation);
userRouter.post("/login", loginUser);
userRouter.post("/admin", loginAdmin);
userRouter.get("/users",authMiddleware, isAdmin, allUser);
userRouter.get("/users/:id", authMiddleware, isAdmin, getAUser);
userRouter.delete("/users/:id", authMiddleware, isAdmin, deleteUser);
userRouter.post("/users/forget_password", forgetPassword);
userRouter.post("/users/reset_password", resetPassword);
userRouter.post("/users/update/:id", authMiddleware, isAdmin, updatePassword);

export default userRouter