import { SocketStream } from "@fastify/websocket";
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteOptions,
} from "fastify";
import { HTTPCodes, HTTPMethods } from "@drawing-app/shared/build/enums";
import {
  CreateCanvasResponse,
  GetCanvasListResponse,
} from "@drawing-app/shared/build/types";
import { CanvasService } from "./CanvasService";

export class CanvasController {
  constructor(
    private readonly fastify: FastifyInstance,
    private readonly canvasService: CanvasService
  ) {
    this.fastify.route(this.getCanvasList());
    this.fastify.route(this.createCanvas());
    this.fastify.route(this.subscribeChannel());
  }

  getCanvasList(): RouteOptions {
    return {
      url: "/",
      method: HTTPMethods.GET,
      handler: async (
        request: FastifyRequest,
        reply: FastifyReply
      ): Promise<void> => {
        const response: GetCanvasListResponse =
          await this.canvasService.getCanvasList();
        await reply.send(response);
      },
    };
  }

  createCanvas(): RouteOptions {
    return {
      url: "/",
      method: HTTPMethods.POST,
      handler: async (
        request: FastifyRequest,
        reply: FastifyReply
      ): Promise<void> => {
        const canvas = await this.canvasService.createCanvas();
        const response: CreateCanvasResponse = { canvasId: canvas.id };
        await reply.send(response);
      },
    };
  }

  subscribeChannel(): RouteOptions {
    return {
      url: "/channel",
      method: HTTPMethods.GET,
      handler: async (
        request: FastifyRequest,
        reply: FastifyReply
      ): Promise<void> => {
        await reply
          .code(HTTPCodes.BAD_REQUEST)
          .send({ message: "please subscribe via websocket." });
      },
      wsHandler: async (
        connection: SocketStream,
        request: FastifyRequest
      ): Promise<void> => {
        const { userId } = (request as RequestWithUserId).query;
        const canvasConnection = await this.canvasService.assignUser(
          connection,
          userId
        );
        await this.canvasService.listenForMessages(canvasConnection);
      },
    };
  }
}

interface RequestWithUserId {
  query: {
    userId: string;
  };
}
