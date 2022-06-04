import bcrypt from "bcryptjs";
const { genSalt, hash } = bcrypt;

export const registerUser = async (name, email, password) => {
  // dynamic import
  const { user } = await import("../models/user/user.js");

  // generate salt
  const salt = await genSalt(10);

  // hash password with salt
  const hashedPassword = await hash(password, salt);

  // store to db
  const result = await user.insertOne({
    name,
    email: {
      adress: email,
      verified: false,
    },
    password: hashedPassword,
  });

  // return user from db
  return result.insertedId;
};
