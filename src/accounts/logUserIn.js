import { createSession } from "./session.js";
import { createTokens } from "./tokens.js";

export const logUserIn = async (userId, request, reply) => {
  // Generate Object with connection information
  const connectionInformation = {
    ip: request.ip,
    userAgent: request.headers["user-agent"],
  };

  // Create session
  const sessionToken = await createSession(userId, connectionInformation);

  // Create JWT
  const { accessToken, refreshToken } = await createTokens(sessionToken, userId);

  // Get Date 30 days in the future
  const now = new Date();
  const refreshExpires = now.setDate(now.getDate() + 30);

  // Set  Cookie
  reply
    .setCookie("refreshToken", refreshToken, { path: "/", domain: "localhost", httpOnly: true, expires: refreshExpires })
    .setCookie("accessToken", accessToken, { path: "/", domain: "localhost", httpOnly: true });
};
