import { createSession } from "./session.js";
import { refreshTokens } from "./user.js";

export const logUserIn = async (userId, request, reply) => {
  // Generate Object with connection information
  const connectionInformation = {
    ip: request.ip,
    userAgent: request.headers["user-agent"],
  };

  // Create session
  const sessionToken = await createSession(userId, connectionInformation);

  // Refresh Tokens
  await refreshTokens(sessionToken, userId, reply);
};
