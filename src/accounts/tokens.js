import jwt from "jsonwebtoken";

const JWTSignature = process.env.JWT_SIGNATURE;

export const createTokens = async (sessionToken, userId) => {
  try {
    // Create a refresh token (needs Session Id)
    const refreshToken = jwt.sign({ sessionToken }, JWTSignature);

    // Create Acces Token (Session Id, User Id)
    const accessToken = jwt.sign({ sessionToken, userId }, JWTSignature);

    // Return Refresh Token and Access Token
    return { refreshToken, accessToken };
  } catch (error) {
    console.error(error);
  }
};
