import { CanvasEventDto, Command, User } from ".";

export type Message = {
  type?: MessageType;
  canvasId?: string;
  userId?: string;
  command?: Command;
  status?: number;
  data?: CanvasEventDto[] | User | string;
  error?: string;
};

export type MessageType = "command" | "event" | "error";
