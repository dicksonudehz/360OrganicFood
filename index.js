import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import "dotenv/config";
import productRouter from "./route/productRoute.js";
import userRouter from "./route/userRoute.js";
import orderRouter from "./route/orderRoute.js";
import bodyParser from "body-parser";
import blogRouter from "./route/blogRoute.js";
import cartRouter from "./route/cartRoute.js";
import couponRouter from "./route/couponRoute.js";

// initialize express app
const app = express();
const port = 8000;

// middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// end point
app.use("/api/product", productRouter);
app.use("/api/product", productRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);
app.use("/api/blog", blogRouter);
app.use("/api/cart", cartRouter);
app.use("/api/coupon", couponRouter);

app.get("/", (req, res) => {
  res.send("app is working perfectly well");
});

// connect db
connectDB();

app.listen(port, () => {
  console.log(`app running on port: ${port}`);
});
