import express from 'express'
import {allUser, deleteUser, forgetPassword, getAUser, loginAdmin, loginUser, registerUser, resetPassword, updatePassword } from '../controller/userController.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/adminLogin", loginAdmin);
userRouter.get("/users",authMiddleware, isAdmin, allUser);
userRouter.get("/users/:id", authMiddleware, isAdmin, getAUser);
userRouter.delete("/users/:id", authMiddleware, isAdmin, deleteUser);
userRouter.post("/users/forget_password", forgetPassword);
userRouter.post("/users/reset_password", resetPassword);
userRouter.post("/users/update/:id", authMiddleware, isAdmin, updatePassword);

export default userRouter