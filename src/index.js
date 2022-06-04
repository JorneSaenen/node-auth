import "./utils/env.js";
import { fastify } from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./utils/db.js";
import { registerUser } from "./accounts/register.js";
import { authorizeUser } from "./accounts/authorize.js";
import { logUserIn } from "./accounts/logUserIn.js";
import { getUserFromCookies } from "./accounts/user.js";
import { logUserOut } from "./accounts/logUserOut.js";

// ESM speficic features
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init Fastify
const app = fastify({ logger: false });

// Start server function
const startApp = async () => {
  try {
    // Register plugins
    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SIGNATURE,
    });
    app.register(fastifyStatic, {
      root: path.join(__dirname, "public"),
    });
    app.register(fastifyCors, {
      origin: [/\.nodeauth.dev/, "https://nodeauth.dev"],
      credentials: true,
    });

    // Routes
    app.post("/api/register", {}, async (request, reply) => {
      const { email, password, name } = request.body;
      try {
        const userId = await registerUser(name, email, password);
        if (userId) {
          await logUserIn(userId, request, reply);
          reply.send({ data: { status: "SUCCESS", userId } });
        }
      } catch (error) {
        console.error(error);
        reply.send({ data: { status: "FAILED", userId } });
      }
    });

    app.post("/api/authorize", {}, async (request, reply) => {
      const { email, password } = request.body;
      try {
        const { isAuthorized, userId } = await authorizeUser(email, password);
        if (isAuthorized) {
          await logUserIn(userId, request, reply);
          reply.send({ data: { status: "SUCCESS", userId } });
        }
      } catch (error) {
        console.error(error);
        reply.send({ data: { status: "FAILED", userId } });
      }
    });

    app.post("/api/logout", {}, async (request, reply) => {
      try {
        await logUserOut(request, reply);
        reply.send({ data: { status: "SUCCESS" } });
      } catch (error) {
        console.error(error);
        reply.send({ data: { status: "FAILED" } });
      }
    });

    app.get("/test", {}, async (request, reply) => {
      try {
        // Verify user login
        const user = await getUserFromCookies(request, reply);

        // Return user email, if it exist, otherwise return unauthorized
        if (user?._id) {
          reply.send({ data: user });
        } else {
          reply.send({ data: "User Look up failed" });
        }
      } catch (error) {
        throw new Error(error);
      }
    });

    // Start server
    await app.listen(3000);
    console.log(`🚀 Server listening on ${app.server.address().port}!`);
  } catch (err) {
    console.error({ error: err });
    app.log.error(err);
    process.exit(1);
  }
};

// Start server and connect to database
connectDb().then(() => startApp());
