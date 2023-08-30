import { CanvasEventDto } from "./";

export interface CanvasDto {
  id: string;
  latestAggregation: CanvasEventDto[];
}
