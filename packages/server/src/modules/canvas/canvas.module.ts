import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { CanvasController } from "./CanvasController";
import { CanvasService } from "./CanvasService";

export default async function canvasModule(
  fastify: FastifyInstance
): Promise<void> {
  const prismaClient: PrismaClient = new PrismaClient();
  const canvasService: CanvasService = new CanvasService(prismaClient);
  new CanvasController(fastify, canvasService);
}

export const autoPrefix = "/api/canvas";
