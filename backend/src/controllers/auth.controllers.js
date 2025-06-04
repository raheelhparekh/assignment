import  User  from "../models/user.models.js";
import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        error: " all fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "user already exists",
      });
    }
    
    const hashedPassword=await bcrypt.hash(password, 10);
    // console.log(hashedPassword);

    const user = await User.create({
      name,
      email,
      password:hashedPassword
    });

    if (!user) {
      return res.status(500).json({
        error: "user not created",
      });
    }

    return res.status(201).json({
      success: true,
      message: "user created successfully",
      user,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        error: " all fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "user does not exist please register",
      });
    }

    const isPasswordValid = bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: "invalid credentials",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );

    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        email,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("accessToken", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: true,
    });
    res.cookie("refreshToken", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: true,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Error occured while logging out", error)
    return res.status(500).json({
        error:"Internal Server error"
    })
  }
};
