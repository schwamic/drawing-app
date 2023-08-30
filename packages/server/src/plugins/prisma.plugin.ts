import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { PrismaClient } from "@prisma/client";

// Use TypeScript module augmentation to declare the type of fastify.prisma to be PrismaClient
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

/**
 * Plugin to connect Prisma ORM for database interactions
 */
const prismaPlugin: FastifyPluginAsync = fp(
  async (fastify: FastifyInstance) => {
    const prisma: PrismaClient = new PrismaClient();
    await prisma.$connect();
    fastify.decorate("prisma", prisma);
    fastify.addHook("onClose", async (fastify) => {
      await fastify.prisma.$disconnect();
    });
  }
);

export default prismaPlugin;
