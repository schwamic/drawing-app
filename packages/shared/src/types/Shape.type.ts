import { Point2D } from ".";

export type Shape = {
  id: string;
  type: ShapeType;
  data: Line | Circle | Rectangle | Triangle | Pointer;
  draw?(
    ctx: any,
    withFrame?: boolean,
    frameColor?: string,
    lineWidth?: number
  ): void;
  moveTo?: (coordinates: Point2D) => void;
  isPointInside?: (ctx: any, point: Point2D) => boolean;
};

export type ShapeType =
  | "line"
  | "circle"
  | "rectangle"
  | "triangle"
  | "pointer";

export interface Line extends ShapeData {
  from: Point2D;
  to: Point2D;
}

export interface Circle extends ShapeData {
  center: Point2D;
  radius: number;
}

export interface Rectangle extends ShapeData {
  from: Point2D;
  to: Point2D;
}

export interface Triangle extends ShapeData {
  from: Point2D;
  to: Point2D;
}

export interface Pointer extends ShapeData {
  point: Point2D;
}

export interface ShapeData {
  zOrder?: number;
  borderColor?: string;
  fillColor?: string;
}
