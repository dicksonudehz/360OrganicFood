import productModel from "../models/productModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// create a product

const createProduct = async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      price,
      category,
      brand,
      quantity,
      images,
    } = req.body;
    if (
      !userId ||
      !title ||
      !description ||
      !price ||
      !category ||
      !brand ||
      !quantity ||
      !images
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }
    // Create new product instance
    const product = new productModel({
      userId,
      title,
      description,
      price,
      category,
      brand,
      quantity,
      images,
    });
    const productSave = await product.save();
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: productSave,
    });
  } catch (error) {
    console.error("Failed to create product in database", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// update a product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProductId = await productModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedProductId) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    } else {
      res.json({
        success: true,
        message: "product updated successfully",
        updatedProductId,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// delete a product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteProductId = await productModel.findByIdAndDelete(id);

    if (!deleteProductId) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    } else {
      res.json({
        success: true,
        message: "product delete successfully",
        deleteProductId,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// get all product
const getAllProduct = async (req, res) => {
  try {
    const allProduct = await productModel.find({});
    if (!allProduct) {
      return res.status(404).json({
        success: false,
        message: "no product found",
      });
    } else {
      res.json({
        success: true,
        message: "available product",
        allProduct,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "no product available",
    });
  }
};

// get a single product
const singleProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const singleProduct = await productModel.findById(id);
    if (!singleProduct) {
      return res.status(404).json({
        success: false,
        message: "no product found",
      });
    } else {
      res.json({
        success: true,
        message: "product found",
        singleProduct,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "no product available",
    });
  }
};

const newProduct = async (req, res) => {
  try {
    const products = await productModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10);
    if (!products) {
      res.json({
        success: false,
        message: "no new product available",
      });
    }
    res.json({
      success: true,
      message: "newest product created",
      products,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "no product available",
    });
  }
};

const popularProduct = async (req, res) => {
  try {
    const popularProducts = await productModel
      .find()
      .sort({ averageRating: -1 })
      .limit(10);
    if (!popularProducts) {
      res.json({
        success: false,
        message: "rate a product",
      });
    }
    res.json({
      success: true,
      message: "popular product created",
      popularProducts,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "no product available",
    });
  }
};

const addWishList = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyInWishlist = user.wishList.find((item) =>
      item.productId.equals(product._id)
    );

    if (alreadyInWishlist) {
      user.wishList = user.wishList.filter(
        (item) => !item.productId.equals(product._id)
      );
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        wishlist: user.wishList,
      });
    } else {
      user.wishList.push({
        productId: product._id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        quantity: product.quantity,
        sold: product.sold,
        date: product.date,
        images: product.images,
        rating: product.rating,
        totalRating: product.totalRating,
      });

      await user.save();
      return res.status(200).json({
        success: true,
        message: "Product added to wishlist",
        wishlist: user.wishList,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllProductWishlist = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    console.log("user", user);
    if (!user) {
      res.status(400).json({
        success: true,
        message: "user does not exist",
      });
    }

    if (user.wishList && user.wishList.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Products in the wishList",
        products: user.wishList,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "No products in the wishlist",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "cannot fetch product in the wishlist of this uer",
    });
    console.log(error);
  }
};

const rating = async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await productModel.findById(prodId);
    if (!product) {
      res.json({
        success: false,
        message: "product not found",
      });
    }
    const alreadyRated = product.rating.find(
      (rating) => rating.postedBy.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await productModel.updateOne(
        { _id: prodId, "rating.postedBy": _id },
        { $set: { "rating.$.star": star, "rating.$.comment": comment } },
        { new: true }
      );
    } else {
      const updateRating = await productModel.findByIdAndUpdate(
        prodId,
        {
          $push: {
            rating: { star: star, comment: comment, postedBy: _id },
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "failed",
    });
  }
  const updatedProduct = await productModel.findById(prodId);
  const totalRatings = updatedProduct.rating.length;
  const ratingSum = updatedProduct.rating
    .map((item) => item.star)
    .reduce((prev, curr) => prev + curr, 0);
  const actualRating = Math.round(ratingSum / totalRatings);

  const finalProduct = await productModel.findByIdAndUpdate(
    prodId,
    { totalRating: actualRating },
    { new: true }
  );
  res.json(finalProduct);
};

export {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  singleProduct,
  newProduct,
  popularProduct,
  addWishList,
  rating,
  getAllProductWishlist,
};
