import { ShapeTypes } from "@drawing-app/shared/build/enums";
import {
  Shape,
  Triangle as ITriangle,
  ShapeType,
} from "@drawing-app/shared/build/types";
import { uniqueID } from "../../../../../utils";
import { Colors } from "../../ToolArea/enums";
import { Color } from "../../ToolArea/types";
import { AbstractShape } from "./AbstractShape";

const HIGHLIGHT = "28, 118, 197";

export class Triangle extends AbstractShape implements Shape {
  public id: string;
  public type: ShapeType;
  public data: ITriangle;

  constructor(shape: Partial<Shape>) {
    super();
    this.id = shape.id ?? uniqueID();
    this.type = ShapeTypes.triangle;
    this.data = {
      from: (shape.data as ITriangle).from,
      to: (shape.data as ITriangle).to,
      borderColor: (shape.data as ITriangle).borderColor,
      fillColor: (shape.data as ITriangle).fillColor,
      zOrder: shape.data?.zOrder ?? -1,
    };
  }

  draw(
    ctx: CanvasRenderingContext2D,
    withFrame = false,
    frameColor = HIGHLIGHT
  ): void {
    ctx.beginPath();
    ctx.moveTo(
      this.data.from.x + (this.data.to.x - this.data.from.x) / 2,
      this.data.from.y
    );
    ctx.lineTo(this.data.from.x, this.data.to.y);
    ctx.lineTo(this.data.to.x, this.data.to.y);
    ctx.lineTo(
      this.data.from.x + (this.data.to.x - this.data.from.x) / 2,
      this.data.from.y
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
}
