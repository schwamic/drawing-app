import { ShapeTypes } from "@drawing-app/shared/build/enums";
import { Point2D, Shape } from "@drawing-app/shared/build/types";
import { Line, Rectangle, Circle, Triangle, Pointer } from "./shapes";

export class ShapeFactory {
  create(rawShape: Partial<Shape>, currentShapes?: Shape[]): Shape | undefined {
    let result;
    if (currentShapes && currentShapes.length > 0) {
      rawShape.data!.zOrder = this.createZOrder(currentShapes);
    }
    switch ((rawShape as Partial<Shape>).type) {
      case ShapeTypes.line:
        result = new Line(rawShape);
        break;
      case ShapeTypes.circle:
        result = new Circle(rawShape);
        break;
      case ShapeTypes.rectangle:
        result = new Rectangle(rawShape);
        break;
      case ShapeTypes.triangle:
        result = new Triangle(rawShape);
        break;
      case ShapeTypes.pointer:
        result = new Pointer(rawShape);
        break;
      default:
        console.error(
          `ShapeFactory can't create shape with type: ${
            (rawShape as Partial<Shape>).type
          }`
        );
    }
    return result;
  }

  calculateRadius(from: Point2D, to: Point2D): number {
    return Circle.calculateRadius(from, to);
  }

  createZOrder(shapes: Shape[], toForeground = true) {
    const zOrders: number[] = shapes.map((shape) => shape.data.zOrder ?? -1);
    return toForeground
      ? Math.max(...zOrders, 0) + 1
      : Math.min(...zOrders, 0) - 1;
  }
}
