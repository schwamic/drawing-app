import { ShapeTypes } from "@drawing-app/shared/build/enums/ShapeTypes.enum";
import {
  ShapeType,
  Shape,
  Pointer as IPointer,
} from "@drawing-app/shared/build/types";

export class Pointer implements Shape {
  public id: string;
  public type: ShapeType;
  public data: IPointer;

  constructor(shape: Partial<Shape>) {
    this.id = shape.id!;
    this.type = ShapeTypes.pointer;
    this.data = {
      point: (shape.data as IPointer).point,
      fillColor: (shape.data as IPointer).fillColor,
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { point, fillColor } = this.data;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x, point.y + 16);
    ctx.lineTo(point.x + 4.5, point.y + 10);
    ctx.lineTo(point.x + 12, point.y + 10);
    ctx.lineTo(point.x, point.y);
    ctx.fillStyle = `rgb(${fillColor})`;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = `rgb(255,255,255)`;
    ctx.stroke();
  }
}
