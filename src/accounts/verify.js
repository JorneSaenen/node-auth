import crypto from "crypto";
const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env;

export const createVerifyEmailToken = async (email) => {
  // Auth string, JWT Signature, email
  try {
    const authString = `${JWT_SIGNATURE}:${email}`;
    return crypto.createHash("sha256").update(authString).digest("hex");
  } catch (error) {
    console.error(error);
  }
};

export const createVerifyEmailLink = async (email) => {
  try {
    // Create token
    const emailToken = await createVerifyEmailToken(email);

    // Encode url string
    const URIencodedEmail = encodeURIComponent(email);

    // Return link for verification
    return `https://${ROOT_DOMAIN}/verify/${URIencodedEmail}/${emailToken}`;
  } catch (error) {
    console.error(error);
  }
};
