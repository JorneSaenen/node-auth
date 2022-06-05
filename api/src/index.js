import "./utils/env.js";
import { authenticator } from "@otplib/preset-default";
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
import { getUserFromCookies, changePassword, register2fa } from "./accounts/user.js";
import { logUserOut } from "./accounts/logUserOut.js";
import { sendEmail, mailInit } from "./mail/index.js";
import { createVerifyEmailLink, validateVerifyEmail } from "./accounts/verify.js";
import { createResetLink, validateResetEmail } from "./accounts/reset.js";

// ESM speficic features
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init Fastify
const app = fastify();

// Start server function
const startApp = async () => {
  try {
    // Init mail server
    await mailInit();

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

    app.get("/api/user", {}, async (request, reply) => {
      try {
        const user = await getUserFromCookies(request, reply);

        if (user) {
          return reply.send({ data: { user } });
        }
        return reply.send({});
      } catch (error) {
        console.error(error);
        return { error };
      }
    });

    // Routes
    app.post("/api/register", {}, async (request, reply) => {
      const { email, password, name } = request.body;
      try {
        const userId = await registerUser(name, email, password);
        // If account creations was successful, send verification email
        if (userId) {
          const emailLink = await createVerifyEmailLink(email);
          await sendEmail({ to: email, subject: "Test email", html: `<a href="${emailLink}">Verify</a>` });
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

    app.post("/api/change-password", {}, async (request, reply) => {
      try {
        const { oldPassword, newPassword } = request.body;

        // Verify User login
        const user = await getUserFromCookies(request);
        console.log(user);
        if (user?.email?.address) {
          // Compare current logged in user with form to re-auth
          const { isAuthorized, userId } = await authorizeUser(user.email.address, oldPassword);

          // If user is authorized, change password
          if (isAuthorized) {
            // Hash new password and change password in database
            await changePassword(userId, newPassword);
            return reply.code(200).send();
          }
        }
        return reply.code(401).send();
      } catch (error) {
        console.error(error);
        return reply.code(401).send();
      }
    });

    app.post("/api/verify", {}, async (request, reply) => {
      try {
        const { email, token } = request.body;
        const isValid = await validateVerifyEmail(token, email);
        if (isValid) {
          return reply.code(200).send();
        }
        return reply.code(401).send();
      } catch (error) {
        console.error(error);
        return reply.code(401).send();
      }
    });

    app.post("/api/forgot-password", {}, async (request, reply) => {
      try {
        const { email } = request.body;
        const link = await createResetLink(email);

        // If link/user exist send email with reset link
        if (link) {
          await sendEmail({
            to: email,
            subject: "Reset your password",
            html: `<a href="${link}">Reset</a>`,
          });
        }

        // Always return 200
        return reply.code(200).send();
      } catch (error) {
        console.error(error);
        return reply.code(401).send();
      }
    });

    app.post("/api/reset", {}, async (request, reply) => {
      try {
        const { email, token, password, time } = request.body;
        const isValid = await validateResetEmail(token, email, time);
        if (isValid) {
          // Find current user with email
          const { user } = await import("./models/user/user.js");
          const foundUser = await user.findOne({ "email.address": email });
          if (foundUser._id) {
            // Change password
            await changePassword(foundUser._id, password);
            return reply.code(200).send("Password updated");
          }
        }
        return reply.code(401).send("Reset Failed");
      } catch (error) {
        console.error(error);
        return reply.code(401).send();
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

    app.post("/api/2fa-register", {}, async (request, reply) => {
      try {
        const user = await getUserFromCookies(request, reply);
        const { token, secret } = request.body;
        const isValid = authenticator.verify({ token, secret });
        console.log("isValid", isValid);
        if (isValid && user._id) {
          await register2fa(user._id, secret);
          return reply.status(200).send("Success");
        }
        return reply.code(401).send();
      } catch (error) {
        console.error(error);
        return reply.code(401).send();
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
