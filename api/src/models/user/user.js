import { client } from "../../utils/db.js";

export const user = client.db("auth").collection("users");

user.createIndex({ "email.address": 1 });
