import { resolve } from "path";
import fp from "fastify-plugin";
import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyStatic from "@fastify/static";

const PATH_TO_CLIENT = resolve(process.cwd(), "../client/dist");

/**
 * Plugin to serve static web app with routing support
 */
const clientPlugin: FastifyPluginAsync = fp(
  async (fastify: FastifyInstance) => {
    await fastify.register(fastifyStatic, {
      root: PATH_TO_CLIENT,
      prefix: "/",
    });

    fastify.setNotFoundHandler(
      async (request: FastifyRequest, reply: FastifyReply) => {
        if (request?.raw?.url?.startsWith("/api")) {
          return reply.status(404).send({
            success: false,
            error: { message: "Not Found" },
          });
        }
        await reply.status(200).sendFile("index.html", PATH_TO_CLIENT);
      }
    );
  }
);

export default clientPlugin;
