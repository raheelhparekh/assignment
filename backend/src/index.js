import app from "./app.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDb from "./db/db.js";
import userRoutes from "./routes/auth.routes.js";
import express from "express"
import bookRoutes from "./routes/book.routes.js";

dotenv.config({
  path: "./.env",
});

//cors middleware to allow cross-origin requests
app.use(
  cors({
    origin: process.env.BASE_URL,
    methods: ["GET", "POST", "UPDATE", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// cookie parser middleware to parse cookies from the request
app.use(cookieParser());
app.use(express.json()); // accepts json values from frontend
app.use(express.urlencoded({ extended: true })); // from url when you get %20 which means so to understand url encoded is required

// routes
app.use("/api/v1/auth",userRoutes)
app.use("/api/v1/books", bookRoutes);

const PORT = process.env.PORT || 8000;

// database connection and server start
connectDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on Port : ${PORT}`));
  })
  .catch((err) => {
    console.error("mongo db connection error", err);
    process.exit(1);
  });
