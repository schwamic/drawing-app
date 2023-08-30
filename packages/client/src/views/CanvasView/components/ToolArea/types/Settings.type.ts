import { ShapeType } from "@drawing-app/shared/build/types";
import { Color, FillState, ToolType } from ".";

export interface Settings {
  shapeType: ShapeType;
  toolType: ToolType;
  color: Color;
  fill: FillState;
}
