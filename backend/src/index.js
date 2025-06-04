import app from "./app.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDb from "./db/db.js";
import userRoutes from "./routes/auth.routes.js";
import express from "express"

dotenv.config({
  path: "./.env",
});

app.use(
  cors({
    origin: process.env.BASE_URL,
    methods: ["GET", "POST", "UPDATE", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json()); // accepts json values
app.use(express.urlencoded({ extended: true })); // from url when you get %20 which means so to understand url encoded is required


app.use("/api/v1/auth",userRoutes)

const PORT = process.env.PORT || 8000;

connectDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on Port : ${PORT}`));
  })
  .catch((err) => {
    console.error("mongo db connection error", err);
    process.exit(1);
  });
