import {
  Circle,
  Line,
  Point2D,
  Rectangle,
  Triangle,
} from "@drawing-app/shared/build/types";

export abstract class AbstractShape {
  public data: Triangle | Rectangle | Line | Circle | undefined;

  abstract draw(ctx: CanvasRenderingContext2D): void;

  /**
   * Default: Rectangle/Triangle
   */
  protected addSelectionFrameToContext(
    ctx: CanvasRenderingContext2D,
    rgbColor: string
  ): void {
    this.data = this.data as Rectangle | Triangle;
    ctx.fillStyle = `rgb(${rgbColor})`;
    ctx.fillRect(this.data.from.x - 4, this.data.from.y - 4, 8, 8);
    ctx.fillRect(this.data.from.x - 4, this.data.to.y - 4, 8, 8);
    ctx.fillRect(this.data.to.x - 4, this.data.to.y - 4, 8, 8);
    ctx.fillRect(this.data.to.x - 4, this.data.from.y - 4, 8, 8);
    ctx.fillStyle = `rgba(${rgbColor},0.2)`;
    ctx.fillRect(
      this.data.from.x,
      this.data.from.y,
      this.data.to.x - this.data.from.x,
      this.data.to.y - this.data.from.y
    );
  }

  /**
   * Default: Rectangle/Triangle/Circle
   */
  isPointInside(ctx: CanvasRenderingContext2D, point: Point2D): boolean {
    this.draw(ctx);
    return (
      ctx.isPointInPath(point.x, point.y) ||
      ctx.isPointInStroke(point.x, point.y)
    );
  }

  /**
   * Default: Rectangle/Triangle/Line
   */
  moveTo(coordinates: Point2D): void {
    this.data = this.data as Triangle | Rectangle | Line;
    const height = this.data.to.x - this.data.from.x;
    const width = this.data.to.y - this.data.from.y;
    this.data.from = {
      x: coordinates.x - height / 2,
      y: coordinates.y - width / 2,
    };
    this.data.to = {
      x: this.data.from.x + height,
      y: this.data.from.y + width,
    };
  }
}
