import { CanvasSocketStream } from "./";

export interface Rooms {
  [canvasID: string]: CanvasSocketStream[];
}
