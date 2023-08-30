import { ShapeTypes } from "@drawing-app/shared/build/enums";
import {
  Shape,
  Circle as ICircle,
  ShapeType,
  Point2D,
} from "@drawing-app/shared/build/types";
import { uniqueID } from "../../../../../utils";
import { Colors } from "../../ToolArea/enums";
import { Color } from "../../ToolArea/types";
import { AbstractShape } from "./AbstractShape";

const HIGHLIGHT = "28, 118, 197";

export class Circle extends AbstractShape implements Shape {
  public id: string;
  public type: ShapeType;
  public data: ICircle;

  constructor(shape: Partial<Shape>) {
    super();
    this.id = shape.id ?? uniqueID();
    this.type = ShapeTypes.circle;
    this.data = {
      center: (shape.data as ICircle).center,
      radius: (shape.data as ICircle).radius,
      borderColor: (shape.data as ICircle).borderColor,
      fillColor: (shape.data as ICircle).fillColor,
      zOrder: shape.data?.zOrder ?? -1,
    };
  }

  static calculateRadius(from: Point2D, to: Point2D) {
    const xDiff = Math.abs(from.x - to.x);
    const yDiff = Math.abs(from.y - to.y);
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    withFrame = false,
    frameColor = HIGHLIGHT
  ): void {
    ctx.beginPath();
    ctx.arc(
      this.data.center.x,
      this.data.center.y,
      this.data.radius,
      0,
      2 * Math.PI
    );
    if (this.data.fillColor) {
      ctx.fillStyle = `rgba(${Colors[this.data.fillColor as Color]},0.5)`;
      ctx.fill();
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgb(${Colors[this.data.borderColor as Color]})`;
    ctx.stroke();
    if (withFrame) {
      this.addSelectionFrameToContext(ctx, frameColor);
    }
  }

  moveTo(coordinates: Point2D): void {
    this.data.center = coordinates;
  }

  protected addSelectionFrameToContext(
    ctx: CanvasRenderingContext2D,
    rgbColor: string
  ): void {
    ctx.fillStyle = `rgb(${rgbColor})`;
    ctx.fillRect(
      this.data.center.x - this.data.radius - 4,
      this.data.center.y - this.data.radius - 4,
      8,
      8
    );
    ctx.fillRect(
      this.data.center.x + this.data.radius - 4,
      this.data.center.y - this.data.radius - 4,
      8,
      8
    );
    ctx.fillRect(
      this.data.center.x - this.data.radius - 4,
      this.data.center.y + this.data.radius - 4,
      8,
      8
    );
    ctx.fillRect(
      this.data.center.x + this.data.radius - 4,
      this.data.center.y + this.data.radius - 4,
      8,
      8
    );
    ctx.fillStyle = `rgba(${rgbColor},0.2)`;
    ctx.fillRect(
      this.data.center.x - this.data.radius,
      this.data.center.y - this.data.radius,
      2 * this.data.radius,
      2 * this.data.radius
    );
  }
}
