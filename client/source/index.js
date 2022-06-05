import { fastify } from "fastify";
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
    // Start server
    await app.listen(3001);
    console.log(`🚀 Client listening on ${app.server.address().port}!`);
  } catch (error) {
    console.error({ error: err });
    app.log.error(err);
    process.exit(1);
  }
};

startApp();
