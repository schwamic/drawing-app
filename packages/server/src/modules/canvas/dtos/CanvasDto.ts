import { Canvas, CanvasEvent } from "@prisma/client";
import { CanvasEventDto } from "./CanvasEventDto";
import { CanvasDto as ICanvasDto } from "@drawing-app/shared/build/types";

export class CanvasDto implements ICanvasDto {
  id!: string;
  latestAggregation!: CanvasEventDto[];

  constructor(data: CanvasDto) {
    Object.assign(this, data);
  }

  static fromCanvas(canvas: Canvas): CanvasDto {
    return new CanvasDto({
      id: canvas.id,
      latestAggregation: canvas.latestAggregation.map((event) =>
        CanvasEventDto.fromCanvasEvent(event as unknown as CanvasEvent)
      ),
    });
  }

  static fromCanvasList(canvas: Canvas[]): string[] {
    return canvas.map((canvas) => canvas.id);
  }
}
