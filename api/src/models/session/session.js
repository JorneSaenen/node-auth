import { client } from "../../utils/db.js";

export const session = client.db("auth").collection("session");

session.createIndex({ sessionToken: 1 });
