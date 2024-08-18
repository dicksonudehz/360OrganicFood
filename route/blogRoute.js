import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogPost,
  isDislikedBlog,
  likedBlog,
  singleBlog,
  updateBlog,
} from "../controller/blogController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const blogRouter = express.Router();

blogRouter.post("/create", authMiddleware, isAdmin, createBlog);
blogRouter.get("/all",  authMiddleware, getAllBlogPost);
blogRouter.get("/single/:id",authMiddleware, singleBlog);
blogRouter.delete("/delete/:id", authMiddleware, isAdmin, deleteBlog);
blogRouter.put("/update/:id",  authMiddleware, isAdmin, updateBlog);
blogRouter.put("/like", authMiddleware, likedBlog);
blogRouter.put("/dislike", authMiddleware, isDislikedBlog);

export default blogRouter
