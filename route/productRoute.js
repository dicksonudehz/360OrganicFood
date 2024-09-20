import express from "express";
import {
  addWishList,
  createProduct,
  deleteProduct,
  getAllProduct,
  getAllProductWishlist,
  newProduct,
  popularProduct,
  rating,
  singleProduct,
  updateProduct,
} from "../controller/productController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const productRouter = express.Router();
productRouter.post("/create", authMiddleware, isAdmin, createProduct);
productRouter.put("/update/:id", authMiddleware, isAdmin, updateProduct);
productRouter.delete("/delete/:id", authMiddleware, isAdmin, deleteProduct);
productRouter.get("/all", getAllProduct);
productRouter.get("/single/:id", authMiddleware, singleProduct);
productRouter.get("/new", newProduct);
productRouter.get("/popular", popularProduct);
productRouter.get("/allwishlist/:id", authMiddleware, getAllProductWishlist);
productRouter.post("/wishlist/", authMiddleware, addWishList);
productRouter.put("/rating/", authMiddleware, rating);

export default productRouter;
