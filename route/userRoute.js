import express from "express";
import {
  allDistributorByLocation,
  allUser,
  blockDistributor,
  createDistributor,
  deleteDistributor,
  deleteUser,
  distributorMostSaleProduct,
  fetchAlldistributor,
  filterProdPuchaseByDate,
  forgetPassword,
  getAUser,
  getSingleDistributor,
  loginAdmin,
  loginUser,
  registerUser,
  resetPassword,
  updatedRole,
  updatePassword,
  verifyOTP,
} from "../controller/userController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/disRegister", authMiddleware, isAdmin, createDistributor);
userRouter.get("/distributor", authMiddleware, fetchAlldistributor);
userRouter.get("/singleDistributor", authMiddleware, getSingleDistributor);
userRouter.post("/blockDistributor", authMiddleware, isAdmin, blockDistributor);
userRouter.delete(
  "/deleteDistributor/:id",
  authMiddleware,
  isAdmin,
  deleteDistributor
);
userRouter.get("/prodByDist/:id", authMiddleware, distributorMostSaleProduct);
userRouter.get(
  "/filterProdByD/:id",
  authMiddleware,
  isAdmin,
  filterProdPuchaseByDate
);
userRouter.get(
  "/distributorLocation/",
  authMiddleware,
  isAdmin,
  allDistributorByLocation
);
userRouter.post("/login", loginUser);
userRouter.post("/admin", loginAdmin);
userRouter.get("/users", authMiddleware, isAdmin, allUser);
userRouter.get("/users/:id", authMiddleware, isAdmin, getAUser);
userRouter.delete("/users/:id", authMiddleware, isAdmin, deleteUser);
userRouter.post("/users/forget_password", forgetPassword);
userRouter.post("/users/reset/", resetPassword);
userRouter.post("/users/update/:id", authMiddleware, isAdmin, updatePassword);
userRouter.put("/users/role/", authMiddleware, isAdmin, updatedRole);
userRouter.post("/users/otp/:id", verifyOTP);

export default userRouter;
