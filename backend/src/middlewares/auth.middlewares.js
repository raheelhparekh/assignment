import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // CASE 1: No access and no refresh token
    if (!accessToken) {
      if (!refreshToken) {
        return res.status(401).json({
          message: "Unauthorized access. Please log in.",
          success: false,
        });
      }

      // CASE 2: No access token, but refresh token exists. create new refresh & access token
      try {
        const decodedRefreshTokenData = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findOne({ _id: decodedRefreshTokenData.id });
        if (!user) {
          return res.status(401).json({
            message: "No user found with this refresh token.",
            success: false,
          });
        }

        const newAccessToken = jwt.sign(
          { id: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        const newRefreshToken = jwt.sign(
          { id: user._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        const cookieOptions = {
          httpOnly: true,
          secure: true,
        };

        res.cookie("accessToken", newAccessToken, cookieOptions);
        res.cookie("refreshToken", newRefreshToken, cookieOptions);

        req.user = decodedRefreshTokenData;
        next();
      } catch (error) {
        return res.status(401).json({
          message: "Invalid or expired refresh token.",
          success: false,
        });
      }
    } else {
      // CASE 3: Access token exists. directly login . create new access and refresh tokens too
      try {
        const decodedAccessTokenData = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findOne({ _id: decodedAccessTokenData.id });
        if (!user) {
          return res.status(401).json({
            message: "No user found with this access token.",
            success: false,
          });
        }

        const newAccessToken = jwt.sign(
          { id: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        const newRefreshToken = jwt.sign(
          { id: user._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        const cookieOptions = {
          httpOnly: true,
          secure: true,
        };

        res.cookie("accessToken", newAccessToken, cookieOptions);
        res.cookie("refreshToken", newRefreshToken, cookieOptions);

        req.user = decodedAccessTokenData;
        next();
      } catch (error) {
        return res.status(401).json({
          message: "Invalid or expired access token.",
          success: false,
        });
      }
    }
  } catch (error) {
    console.error("Auth middleware failure:", error);
    return res.status(500).json({
      message: "Authentication middleware failed. Please try again later.",
      success: false,
    });
  }
};