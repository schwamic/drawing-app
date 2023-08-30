/* eslint-disable @typescript-eslint/no-misused-promises */
import { Canvas, CanvasEvent, PrismaClient, User } from "@prisma/client";
import { WebSocket } from "ws";
import {
  CommandTypes,
  EventTypes,
  MessageTypes,
  HTTPCodes,
} from "@drawing-app/shared/build/enums";
import { Message, Shape } from "@drawing-app/shared/build/types";
import { CanvasSocketStream, CanvasWithEvents, Rooms } from "../../types";
import { generateRandomColor } from "../../utils/index";
import { CanvasDto, CanvasEventDto } from "./dtos";
import logger from "../../logger";

export class CanvasService {
  private rooms: Rooms = {};

  constructor(private readonly prismaClient: PrismaClient) {}

  public async createCanvas(): Promise<CanvasDto> {
    const canvas = await this.prismaClient.canvas.create({ data: {} });
    this.rooms[canvas.id] = [];
    return CanvasDto.fromCanvas(canvas);
  }

  public async getCanvasList(): Promise<string[]> {
    const canvas = await this.prismaClient.canvas.findMany({});
    return CanvasDto.fromCanvasList(canvas);
  }

  public async assignUser(
    connection: CanvasSocketStream,
    userId: string
  ): Promise<CanvasSocketStream> {
    let user: User | null = null;
    if (userId) {
      user = await this.prismaClient.user.findFirst({
        where: { id: userId },
      });
    }
    if (user === null) {
      user = await this.prismaClient.user.create({
        data: {
          color: generateRandomColor(),
        },
      });
    }
    connection.userId = user.id;
    connection.socket.send(
      JSON.stringify({
        status: HTTPCodes.OK,
        type: MessageTypes.command,
        command: CommandTypes.connect,
        data: user,
      } as Message)
    );
    return connection;
  }

  public async listenForMessages(
    connection: CanvasSocketStream
  ): Promise<void> {
    connection.socket.on("message", async (data: string): Promise<void> => {
      const message = JSON.parse(data) as Message;
      switch (message.type) {
        case MessageTypes.event:
          await this.handleEvents(connection, message);
          break;
        case MessageTypes.command:
        case MessageTypes.error:
          break;
        default:
          connection.socket.send(
            JSON.stringify({
              type: MessageTypes.error,
              status: HTTPCodes.BAD_REQUEST,
              error: `Message "${message.type}" does not exisit.`,
            } as Message)
          );
      }
    });
    connection.socket.on("close", async (): Promise<void> => {
      const index = this.rooms[`${connection.canvasId}`]?.findIndex(
        (roomConnection) => roomConnection.userId !== connection.userId
      );
      if (index >= 0) {
        const message: Message = {
          type: MessageTypes.command,
          canvasId: connection.canvasId!,
          userId: connection.userId!,
          data: [
            {
              event: EventTypes.unregisterForCanvas,
              userId: connection.userId!,
            } as CanvasEventDto,
          ],
        };
        await this.handleUnregistration(connection, message);
      } else {
        connection.destroy();
      }
    });
  }

  private async handleEvents(
    connection: CanvasSocketStream,
    message: Message
  ): Promise<void> {
    const canvasEvents: CanvasEventDto[] = message.data as CanvasEventDto[];
    if (canvasEvents.length <= 0) {
      return;
    }
    if (canvasEvents[0].event === EventTypes.registerForCanvas) {
      await this.handleRegistration(connection, message);
    } else if (canvasEvents[0].event === EventTypes.unregisterForCanvas) {
      await this.handleUnregistration(connection, message);
    } else {
      // We do not save addPointer, removePointer events in the database.
      const filteredCanvasEvents = canvasEvents
        .filter((event) => EventTypes[`${event.event}`] !== undefined)
        .filter(
          (event) =>
            event.event !== EventTypes.addPointer &&
            event.event !== EventTypes.removePointer
        );
      const createdCanvasEvents = await this.prismaClient.$transaction(
        filteredCanvasEvents.map((event) =>
          this.prismaClient.canvasEvent.create({
            data: CanvasEventDto.toCanvasEvent(
              message,
              event as CanvasEventDto
            ),
          })
        )
      );
      const newMessage: Message = {
        type: MessageTypes.event,
        userId: message.userId,
        canvasId: message.canvasId,
        data: [
          ...createdCanvasEvents.map((event) =>
            CanvasEventDto.fromCanvasEvent(event)
          ),
          ...canvasEvents.filter(
            (event) =>
              event.event === EventTypes.addPointer ||
              event.event === EventTypes.removePointer
          ),
        ],
      };
      this.broadcast(
        this.rooms[newMessage.canvasId!].filter(
          (client) => client.userId !== newMessage.userId
        ),
        newMessage
      );
    }
  }

  private async handleRegistration(
    connection: CanvasSocketStream,
    message: Message
  ): Promise<void> {
    // 1. Add user to room at the beginning. Therefor the user is able
    // to get updates during the registration process.
    connection.canvasId = message.canvasId;
    if (this.rooms[message.canvasId!]) {
      this.rooms[message.canvasId!].push(connection);
    } else {
      this.rooms[message.canvasId!] = [connection];
    }
    // 2. Send aggregated canvas to user, which can be merged with events
    // during aggregation on the client side.
    const canvas = await this.getAggregatedCanvas(connection);
    connection.socket.send(
      JSON.stringify({
        type: MessageTypes.event,
        data: canvas.latestAggregation,
      } as Message)
    );
    // 3. Save and broadcast CanvasEvent at the end. This marks the end of the
    // registration process.
    const canvasEvent = await this.prismaClient.canvasEvent.create({
      data: CanvasEventDto.toCanvasEvent(message, {
        event: EventTypes.registerForCanvas,
      } as CanvasEventDto),
      include: {
        user: true,
      },
    });
    const newMessage: Message = {
      type: MessageTypes.event,
      userId: message.userId,
      canvasId: message.canvasId,
      data: [CanvasEventDto.fromCanvasEvent(canvasEvent)],
    };
    this.broadcast(this.rooms[message.canvasId!], newMessage);
  }

  private async handleUnregistration(
    connection: CanvasSocketStream,
    message: Message
  ): Promise<void> {
    // 1. Destroy connection
    this.rooms[message.canvasId!] = this.rooms[message.canvasId!].filter(
      (connection) => connection.userId !== message.userId
    );
    connection.socket.send(
      JSON.stringify({
        status: HTTPCodes.OK,
        type: MessageTypes.command,
        command: CommandTypes.disconnect,
      } as Message)
    );
    connection.destroy();
    // 2. Save and broadcast CanvasEvents at the end.
    const canvas = await this.getAggregatedCanvas(connection);
    const unselectEvents: Partial<CanvasEventDto>[] = canvas.latestAggregation
      .filter(
        (canvasEvent) =>
          canvasEvent.event === EventTypes.selectShape &&
          canvasEvent.userId === message.userId
      )
      .map((canvasEvent) => {
        return {
          event: EventTypes.unselectShape,
          shapeId: canvasEvent.shapeId,
        };
      });
    const unregisterEvent: Partial<CanvasEventDto> = {
      userId: message.userId!,
      event: EventTypes.unregisterForCanvas,
    };
    const canvasEvents = await this.prismaClient.$transaction(
      [...unselectEvents, unregisterEvent].map((event) =>
        this.prismaClient.canvasEvent.create({
          data: CanvasEventDto.toCanvasEvent(message, event as CanvasEventDto),
        })
      )
    );
    const newMessage: Message = {
      type: MessageTypes.event,
      userId: message.userId,
      canvasId: message.canvasId,
      data: canvasEvents.map((event) => CanvasEventDto.fromCanvasEvent(event)),
    };
    this.broadcast(this.rooms[message.canvasId!], newMessage);
  }

  private broadcast(connections: CanvasSocketStream[], message: Message) {
    connections.forEach((connection: CanvasSocketStream) => {
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.send(JSON.stringify(message));
      }
    });
  }

  private async getAggregatedCanvas(
    connection: CanvasSocketStream
  ): Promise<CanvasDto> {
    const canvasId = connection.canvasId;
    const canvas = await this.prismaClient.canvas.findFirst({
      where: {
        id: canvasId,
      },
    });
    const canvasWithEvents = (await this.prismaClient.canvas.findFirst({
      where: {
        id: canvasId,
      },
      include: {
        events: {
          where: {
            created: {
              gte: canvas?.updated ?? canvas?.created,
            },
          },
          include: {
            user: true,
          },
          orderBy: {
            created: "asc",
          },
        },
      },
    })) as CanvasWithEvents;
    const currentSnapshot = this.createSnapshot(canvasWithEvents);
    const updatedCanvas: Canvas = await this.prismaClient.canvas.update({
      where: {
        id: canvasId,
      },
      data: {
        latestAggregation: currentSnapshot as any,
      },
    });
    return CanvasDto.fromCanvas(updatedCanvas);
  }

  /**
   * The function assumes that the events are already sorted.
   * A snapshot consists only of "addShape", "selectShape" and "registerForCanvas" events.
   */
  private createSnapshot(canvas: CanvasWithEvents): CanvasEvent[] {
    let snapshot = [...canvas.latestAggregation] as unknown as CanvasEvent[];
    const removeShapeWithId = (
      snapshot: CanvasEvent[],
      canvasEvent: CanvasEvent
    ): CanvasEvent[] => {
      return snapshot.filter((snap) => {
        const snapId = snap.shapeId ?? (snap.shape as unknown as Shape)?.id;
        const canvasId =
          canvasEvent.shapeId ?? (canvasEvent.shape as unknown as Shape)?.id;
        return snapId !== canvasId;
      });
    };
    const removeSelectionStates = (
      snapshot: CanvasEvent[],
      canvasEvent: CanvasEvent
    ): CanvasEvent[] => {
      return snapshot.filter((snap) => {
        return !(
          snap.shapeId === canvasEvent.shapeId &&
          (snap.event === EventTypes.selectShape ||
            snap.event === EventTypes.unselectShape)
        );
      });
    };
    const removeUserWithId = (
      snapshot: CanvasEvent[],
      canvasEvent: CanvasEvent
    ): CanvasEvent[] => {
      return snapshot.filter((snap) => {
        return !(
          snap.userId === canvasEvent.userId &&
          (snap.event === EventTypes.registerForCanvas ||
            snap.event === EventTypes.unregisterForCanvas)
        );
      });
    };

    canvas.events.forEach((canvasEvent) => {
      switch (canvasEvent.event) {
        case EventTypes.addShape:
          snapshot = removeShapeWithId(snapshot, canvasEvent);
          snapshot.push(canvasEvent);
          break;
        case EventTypes.removeShape:
          snapshot = removeShapeWithId(snapshot, canvasEvent);
          break;
        case EventTypes.selectShape:
          snapshot = removeSelectionStates(snapshot, canvasEvent);
          snapshot.push(canvasEvent);
          break;
        case EventTypes.unselectShape:
          snapshot = removeSelectionStates(snapshot, canvasEvent);
          break;
        case EventTypes.registerForCanvas:
          snapshot = removeUserWithId(snapshot, canvasEvent);
          snapshot.push(canvasEvent);
          break;
        case EventTypes.unregisterForCanvas:
          snapshot = removeUserWithId(snapshot, canvasEvent);
          break;
        default:
          logger.error(`createSnapshot: ${canvasEvent.event} not supported!`);
      }
    });
    return snapshot;
  }
}
