import bcrypt from "bcryptjs";
const { compare } = bcrypt;

export const authorizeUser = async (email, password) => {
  // dynamic import
  const { user } = await import("../models/user/user.js");
  try {
    // get user from db
    const userFromDb = await user.findOne({ "email.adress": email });
    if (userFromDb) {
      // get password
      const passwordFromDb = userFromDb?.password;

      // compare password
      const isAuthorized = await compare(password, passwordFromDb);

      // return boolean of isAuthorized
      return { isAuthorized, userId: userFromDb._id };
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error(error);
    return { isAuthorized: false, userId: null };
  }
};
