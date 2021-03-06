import mongo from "mongodb";
import jwt from "jsonwebtoken";
import { createTokens } from "./tokens.js";
import bcrypt from "bcryptjs";
const { genSalt, hash } = bcrypt;
const { ObjectId } = mongo;

const JWTSignature = process.env.JWT_SIGNATURE;
const { ROOT_DOMAIN } = process.env;

export const getUserFromCookies = async (request, reply) => {
  try {
    // Dynamic imports
    const { user } = await import("../models/user/user.js");
    const { session } = await import("../models/session/session.js");

    // Check if accessToken exists
    if (request?.cookies?.accessToken) {
      // If access token
      const { accessToken } = request.cookies;

      // Decode access token
      const decodedAccessToken = jwt.verify(accessToken, JWTSignature);

      // Return user from record
      const userData = await user.findOne({ _id: ObjectId(decodedAccessToken?.userId) });
      return userData;
    }

    // Check if refreshToken exists
    if (request?.cookies?.refreshToken) {
      // If refresh token
      const { refreshToken } = request.cookies;

      // Decode refresh token
      const decodedRefreshToken = jwt.verify(refreshToken, JWTSignature);

      // Look up session
      const currentSession = await session.findOne({ sessionToken: decodedRefreshToken.sessionToken });

      // Confirm session is valid
      if (currentSession.valid) {
        // Look up current user
        const currentUser = await user.findOne({ _id: ObjectId(currentSession.userId) });

        // Refresh tokens
        await refreshTokens(decodedRefreshToken.sessionToken, currentUser._id, reply);

        // Refresh current user
        return currentUser;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export const refreshTokens = async (sessionToken, userId, reply) => {
  try {
    // Create JWT
    const { accessToken, refreshToken } = await createTokens(sessionToken, userId);

    // Get Date 30 days in the future
    const now = new Date();
    const refreshExpires = now.setDate(now.getDate() + 30);

    // Set Cookie
    reply
      .setCookie("refreshToken", refreshToken, { path: "/", domain: ROOT_DOMAIN, httpOnly: true, secure: true, expires: refreshExpires })
      .setCookie("accessToken", accessToken, { path: "/", domain: ROOT_DOMAIN, httpOnly: true, secure: true });
  } catch (error) {
    console.error(error);
  }
};

export const changePassword = async (userId, newPassword) => {
  try {
    // Dynamic imports
    const { user } = await import("../models/user/user.js");

    // generate salt
    const salt = await genSalt(10);

    // hash new password with salt
    const hashedPassword = await hash(newPassword, salt);

    // Update password
    const updatedUser = await user.updateOne({ _id: ObjectId(userId) }, { $set: { password: hashedPassword } });
    return updatedUser;
  } catch (error) {
    console.error(error);
  }
};

export const register2fa = async (userId, secret) => {
  try {
    // Dynamic imports
    const { user } = await import("../models/user/user.js");

    // Update authenticator to user
    const updatedUser = await user.updateOne({ _id: ObjectId(userId) }, { $set: { authenticator: secret } });
    return updatedUser;
  } catch (error) {
    console.error(error);
  }
};
