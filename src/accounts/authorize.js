import bcrypt from "bcryptjs";
const { compare } = bcrypt;

export const authorizeUser = async (email, password) => {
  // dynamic import
  const { user } = await import("../models/user/user.js");

  // get user from db
  const userFromDb = await user.findOne({ "email.adress": email });

  // get password
  const passwordFromDb = userFromDb.password;

  // compare password
  const isAuthorized = await compare(password, passwordFromDb);

  // return boolean of isAuthorized
  return { isAuthorized, userId: userFromDb._id };
};
