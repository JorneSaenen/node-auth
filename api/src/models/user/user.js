import { client } from "../../utils/db.js";

export const user = client.db("test").collection("users");

user.createIndex({ "email.adress": 1 });