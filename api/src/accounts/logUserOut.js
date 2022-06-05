import jwt from "jsonwebtoken";

const JWTSignature = process.env.JWT_SIGNATURE;

export const logUserOut = async (request, reply) => {
  try {
    // Dynamic imports
    const { session } = await import("../models/session/session.js");

    if (request?.cookies?.refreshToken) {
      // Get refreshToken
      const { refreshToken } = request.cookies;

      // Decode SessionToken from refreshToken
      const decodedRefreshToken = jwt.verify(refreshToken, JWTSignature);

      // Delete database record for session
      await session.deleteOne({
        sessionToken: decodedRefreshToken.sessionToken,
      });

      // Remove Cookies
      reply.clearCookie("refreshToken").clearCookie("accessToken");
    }
  } catch (error) {
    console.error(error);
  }
};
