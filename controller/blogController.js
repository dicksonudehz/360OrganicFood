import Blog from "../models/blogModel.js";
import User from "../models/userModel.js";

const createBlog = async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const blog = await Blog.create(req.body);
    if (blog) {
      await blog.save();
      res.json({
        success: true,
        message: "blog created successful",
        blog,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "cannot create a blog",
    });
  }
};

const getAllBlogPost = async (req, res) => {
  try {
    const allBlog = await Blog.find({});
    res.json({
      success: true,
      message: "all blog available",
      allBlog,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "error",
    });
  }
};

const singleBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const singleBlog = await Blog.findById(id);
    res.json({
      success: true,
      message: "blog with this particular id",
      singleBlog,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "error",
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteBlog = await Blog.findByIdAndDelete(id, { new: true });
    res.json({
      success: true,
      message: "blog deleted successfully",
      deleteBlog,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "error",
    });
  }
};

const updateBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const update = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    const updatedBlog = update.save();
    res.json({
      success: true,
      message: "blog updated successfully",
      update,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "error",
    });
  }
};

const likedBlog = async (req, res) => {
  const { blogId } = req.body;
  try {
    //find the blog you want to like
    const blog = await Blog.findById(blogId);
    //find the user that want to liked the blog
    const loginUserId = await req?.user?._id;
    //has the user Liked the blog before now ??
    const isLiked = blog?.isLiked;
    //find if the user has disliked the blog
    const alreadyDisliked = blog?.disLikes.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { disLikes: loginUserId },
          isDisLiked: false,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    }
    if (isLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { likes: loginUserId },
          isLiked: true,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    }
  } catch (err) {
    throw new Error(err);
  }
};



const isDislikedBlog = async (req, res) => {
  const { blogId } = req.body;
  try {
    //find the blog you want to like
    const blog = await Blog.findById(blogId);
    //find the user that want to liked the blog
    const loginUserId = await req?.user?._id;
    //has the user disLiked the blog before now ??
    const isDisliked = blog?.isDisLiked;
    //find if the user has disliked the blog
    const alreadyliked = blog?.likes.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    }
    if (isDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { disLikes: loginUserId },
          isDisLiked: false,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { disLikes: loginUserId },
          isDisLiked: true,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    }
  } catch (err) {
    throw new Error(err);
  }
};

export {
  createBlog,
  getAllBlogPost,
  singleBlog,
  deleteBlog,
  updateBlog,
  likedBlog,
  isDislikedBlog,
};
