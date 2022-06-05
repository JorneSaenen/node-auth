import jwt from "jsonwebtoken";

const { JWT_SIGNATURE, ROOT_DOMAIN } = process.env;

export const logUserOut = async (request, reply) => {
  try {
    // Dynamic imports
    const { session } = await import("../models/session/session.js");

    if (request?.cookies?.refreshToken) {
      // Get refreshToken
      const { refreshToken } = request.cookies;

      // Decode SessionToken from refreshToken
      const decodedRefreshToken = jwt.verify(refreshToken, JWT_SIGNATURE);

      // Delete database record for session
      await session.deleteOne({
        sessionToken: decodedRefreshToken.sessionToken,
      });

      // Remove Cookies with cookie options for cross domain communication
      const cookieOptions = {
        path: "/",
        domain: ROOT_DOMAIN,
        httpOnly: true,
        secure: true,
      };

      reply.clearCookie("refreshToken", cookieOptions).clearCookie("accessToken", cookieOptions);
    }
  } catch (error) {
    console.error(error);
  }
};
