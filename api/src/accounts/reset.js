import crypto from "crypto";
const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env;

const validateExpTimestamp = (expTimestamp) => {
  // One day in milliseconds
  const expTime = 24 * 60 * 60 * 1000;

  // Differnce between current time and expTimeStamp
  const dateDiff = +expTimestamp - Date.now();

  // We're expired if not in past OR differenc in time is less than allowed
  const isValid = dateDiff > 0 && dateDiff < expTime;

  // If dateDiff is less than expTime, return true
  return isValid;
};

const createResetToken = (email, expTimeStamp) => {
  try {
    const authString = `${JWT_SIGNATURE}:${email}:${expTimeStamp}`;
    return crypto.createHash("sha256").update(authString).digest("hex");
  } catch (error) {
    console.error(error);
  }
};

export const createResetEmailLink = async (email) => {
  try {
    // Encode url string
    const URIencodedEmail = encodeURIComponent(email);

    // Create timestamp
    const expTimeStamp = Date.now() + 24 * 60 * 60 * 1000;

    // Create token
    const token = createResetToken(email, expTimeStamp);

    // Link email contains user email, token , expiration date
    return `https://${ROOT_DOMAIN}/reset/${URIencodedEmail}/${expTimeStamp}/${token}`;
  } catch (error) {
    console.error(error);
  }
};

export const createResetLink = async (email) => {
  try {
    const { user } = await import("../models/user/user.js");

    // Check if a user exists with that email
    const foundUser = await user.findOne({ "email.address": email });

    // If user exists
    if (foundUser) {
      // Create email link
      const link = await createResetEmailLink(email);

      // return reset link
      return link;
    }

    // if user does not exist, return empty string (falsy)
    return "";
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const validateResetEmail = async (token, email, expTimestamp) => {
  try {
    // Create a hash aka token
    const resetToken = createResetToken(email, expTimestamp);

    // Compare hash with token
    const isValid = resetToken === token;

    // Time is not expired
    const isTimestampValid = validateExpTimestamp(expTimestamp);

    // If token and timestamp are valid, return true
    return isValid && isTimestampValid;
  } catch (error) {
    console.error(error);
    return false;
  }
};
