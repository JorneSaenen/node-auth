import https from "https";
import { fastify } from "fastify";
import fetch from "cross-fetch";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

// ESM speficic features
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init Fastify
const app = fastify({ logger: false });

const startApp = async () => {
  try {
    // Register plugins
    app.register(fastifyStatic, {
      root: path.join(__dirname, "public"),
    });

    app.get("/verify/:email/:token", {}, async (request, reply) => {
      try {
        const { email, token } = request.params;
        const values = { email, token };

        // Allows calls from one server to another over https
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });

        const response = await fetch("https://api.nodeauth.dev/api/verify", {
          method: "POST",
          credentials: "include",
          agent: httpsAgent,
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(values),
        });

        // If email is verified, redirect
        if (response.status === 200) {
          return reply.redirect("/");
        }

        // If email is not verified, redirect to error page
        return reply.code(401).send();
      } catch (error) {
        console.error(error);
        return reply.code(401).send();
      }
    });

    // Start server
    await app.listen(3001);
    console.log(`🚀 UI listening on ${app.server.address().port}!`);
  } catch (error) {
    console.error({ error: err });
    app.log.error(err);
    process.exit(1);
  }
};

startApp();
