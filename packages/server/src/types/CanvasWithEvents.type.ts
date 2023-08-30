import { Canvas, CanvasEvent } from "@prisma/client";

export interface CanvasWithEvents extends Canvas {
  events: CanvasEvent[];
}
