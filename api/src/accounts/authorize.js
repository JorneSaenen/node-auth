import bcrypt from "bcryptjs";
const { compare } = bcrypt;

export const authorizeUser = async (email, password) => {
  // dynamic import
  const { user } = await import("../models/user/user.js");
  try {
    // get user from db
    const userData = await user.findOne({ "email.address": email });
    if (userData) {
      // get password
      const savedPassword = userData?.password;

      // compare password
      const isAuthorized = await compare(password, savedPassword);

      // return boolean of isAuthorized
      return { isAuthorized, userId: userData._id, authenticatorSecret: userData.authenticator };
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error(error);
    return { isAuthorized: false, userId: null };
  }
};
