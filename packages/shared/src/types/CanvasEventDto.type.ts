import { Shape, Event, User } from ".";

export interface CanvasEventDto {
  event: Event;
  userId: string;
  shapeId: string | null;
  shape: Shape | null;
  user: User | null;
}
