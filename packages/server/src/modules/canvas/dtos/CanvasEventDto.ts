import { CanvasEvent, User } from "@prisma/client";
import {
  CanvasEventDto as ICanvasEventDto,
  Event,
  Message,
  Shape,
} from "@drawing-app/shared/build/types";
import { ShapeDto } from "@drawing-app/shared/build/dtos";
import { UserDto } from "./UserDto";

export class CanvasEventDto implements ICanvasEventDto {
  userId!: string;
  event!: Event;
  shapeId!: string | null;
  shape!: ShapeDto | null;
  user!: User | null;

  constructor(data: CanvasEventDto) {
    Object.assign(this, data);
  }

  static fromCanvasEvent(canvasEvent: CanvasEventWithUser): CanvasEventDto {
    return new CanvasEventDto({
      userId: canvasEvent.userId,
      event: canvasEvent.event as unknown as Event,
      shapeId: canvasEvent.shapeId,
      shape: canvasEvent.shape
        ? ShapeDto.fromData(canvasEvent.shape as unknown as Shape)
        : null,
      user: canvasEvent.user
        ? UserDto.fromUser(canvasEvent.user as unknown as User)
        : null,
    });
  }

  static toCanvasEvent(message: Message, event: ICanvasEventDto): any {
    return {
      canvasId: message.canvasId,
      userId: message.userId,
      event: event.event,
      shapeId: event.shapeId,
      shape: event.shape ? ShapeDto.fromData(event.shape) : undefined,
    };
  }
}

interface CanvasEventWithUser extends CanvasEvent {
  user?: User;
}
