import { ShapeTypes } from "@drawing-app/shared/build/enums";
import {
  Shape,
  Line as ILine,
  ShapeType,
  Point2D,
} from "@drawing-app/shared/build/types";
import { uniqueID } from "../../../../../utils";
import { Colors } from "../../ToolArea/enums";
import { Color } from "../../ToolArea/types";
import { AbstractShape } from "./AbstractShape";

const HIGHLIGHT = "28, 118, 197";

export class Line extends AbstractShape implements Shape {
  public id: string;
  public type: ShapeType;
  public data: ILine;

  constructor(shape: Partial<Shape>) {
    super();
    this.id = shape.id ?? uniqueID();
    this.type = ShapeTypes.line;
    this.data = {
      from: (shape.data as ILine).from,
      to: (shape.data as ILine).to,
      borderColor: (shape.data as ILine).borderColor,
      fillColor: (shape.data as ILine).fillColor,
      zOrder: shape.data?.zOrder ?? -1,
    };
  }

  draw(
    ctx: CanvasRenderingContext2D,
    withFrame = false,
    frameColor = HIGHLIGHT,
    lineWidth = 2
  ): void {
    ctx.beginPath();
    ctx.moveTo(this.data.from.x, this.data.from.y);
    ctx.lineTo(this.data.to.x, this.data.to.y);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = `rgb(${Colors[this.data.borderColor as Color]})`;
    ctx.stroke();
    if (withFrame) {
      this.addSelectionFrameToContext(ctx, frameColor);
    }
  }

  isPointInside(ctx: CanvasRenderingContext2D, point: Point2D): boolean {
    this.draw(ctx, false, undefined, 20);
    const isInside = ctx.isPointInStroke(point.x, point.y);
    return isInside;
  }

  protected addSelectionFrameToContext(
    ctx: CanvasRenderingContext2D,
    rgbColor: string
  ): void {
    ctx.fillStyle = `rgb(${rgbColor})`;
    ctx.fillRect(this.data.from.x - 4, this.data.from.y - 4, 8, 8);
    ctx.fillRect(this.data.to.x - 4, this.data.to.y - 4, 8, 8);
    ctx.moveTo(this.data.from.x, this.data.from.y);
    ctx.lineTo(this.data.to.x, this.data.to.y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgb(${rgbColor})`;
    ctx.stroke();
  }
}
