import fastifyAutoload from "@fastify/autoload";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";
import fastify, { FastifyBaseLogger, FastifyInstance, FastifyListenOptions } from "fastify";
import { join } from "path";
import config from "./config";
import logger from "./logger";

// Server configuration
async function bootstrap(): Promise<FastifyInstance> {
  const options = { ...config, logger: logger as FastifyBaseLogger };
  const server = fastify(options);

  await server.register(fastifyCors, {
    origin: config.DISABLED_CORS ? "*" : [/drawing-app/],
  });

  await server.register(fastifyAutoload, {
    dir: join(__dirname, "./plugins"),
    indexPattern: /.*plugin(\.ts|\.js)$/,
    options: options,
  });

  await server.register(fastifyWebsocket);

  await server.register(fastifyAutoload, {
    dir: join(__dirname, "./modules/"),
    maxDepth: 1,
    dirNameRoutePrefix: false,
    indexPattern: /.*module(\.ts|\.js)$/,
    options: options,
  });

  return server;
}

function handleError(error: Error): void {
  logger.error(error);
  process.exit(1);
}

// Run server
bootstrap()
  .then((server: FastifyInstance) => {
    server.listen(
      { port: config.PORT } as FastifyListenOptions,
      (error: Error | null, address: string) => {
        if (error) {
          handleError(error);
        }
        logger.info(`Server listening at ${address}`);
      }
    );
  })
  .catch((error: Error) => {
    handleError(error);
  });
  