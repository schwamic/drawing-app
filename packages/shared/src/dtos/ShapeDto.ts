import {
  Line,
  Circle,
  Rectangle,
  Triangle,
  Pointer,
  ShapeType,
  Shape,
} from "../types";

export class ShapeDto implements Shape {
  id!: string;
  type!: ShapeType;
  data!: Line | Circle | Rectangle | Triangle | Pointer;

  constructor(data: Shape) {
    Object.assign(this, data);
  }

  static fromData(shape: Shape): ShapeDto {
    return new ShapeDto({
      id: shape.id,
      type: shape.type,
      data: shape?.data,
    });
  }
}
