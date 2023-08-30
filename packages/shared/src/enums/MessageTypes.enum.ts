import { MessageType } from "../types";

export const MessageTypes: Record<MessageType, MessageType> = {
  command: "command",
  event: "event",
  error: "error",
};
