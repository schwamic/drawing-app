import { SocketStream } from "@fastify/websocket";

export interface CanvasSocketStream extends SocketStream {
  canvasId?: string;
  userId?: string;
}
