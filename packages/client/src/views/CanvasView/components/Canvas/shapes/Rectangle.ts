import { ShapeTypes } from "@drawing-app/shared/build/enums";
import {
  Shape,
  Rectangle as IRectange,
  ShapeType,
} from "@drawing-app/shared/build/types";
import { uniqueID } from "../../../../../utils";
import { Colors } from "../../ToolArea/enums";
import { Color } from "../../ToolArea/types";
import { AbstractShape } from "./AbstractShape";

const HIGHLIGHT = "28, 118, 197";

export class Rectangle extends AbstractShape implements Shape {
  public id: string;
  public type: ShapeType;
  public data: IRectange;

  constructor(shape: Partial<Shape>) {
    super();
    this.id = shape.id ?? uniqueID();
    this.type = ShapeTypes.rectangle;
    this.data = {
      from: (shape.data as IRectange).from,
      to: (shape.data as IRectange).to,
      borderColor: (shape.data as IRectange).borderColor,
      fillColor: (shape.data as IRectange).fillColor,
      zOrder: shape.data?.zOrder ?? -1,
    };
  }

  draw(
    ctx: CanvasRenderingContext2D,
    withFrame = false,
    frameColor = HIGHLIGHT
  ): void {
    ctx.beginPath();
    ctx.rect(
      this.data.from.x,
      this.data.from.y,
      this.data.to.x - this.data.from.x,
      this.data.to.y - this.data.from.y
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
