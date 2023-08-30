import { request } from "../utils";
import {
  GetCanvasListResponse,
  CreateCanvasResponse,
  Message,
  CanvasEventDto,
  Command,
} from "@drawing-app/shared/build/types";
import { MessageTypes } from "@drawing-app/shared/build/enums/MessageTypes.enum";
import { UserManager } from "./";

export class ApiClient {
  private static instance: ApiClient;
  private ws: WebSocket | undefined = undefined;
  private userManager: UserManager;

  private constructor() {
    this.userManager = UserManager.getInstance();
  }

  public static getInstance() {
    if (this.instance == null) {
      this.instance = new ApiClient();
    }
    return this.instance;
  }

  public async getCanvasList(): Promise<GetCanvasListResponse> {
    return (await request({
      url: `http${process.env.API_URL}/canvas/`,
      method: "GET",
    })) as GetCanvasListResponse;
  }

  public async createCanvas(): Promise<CreateCanvasResponse> {
    return (await request({
      url: `http${process.env.API_URL}/canvas/`,
      method: "POST",
      body: {},
    })) as CreateCanvasResponse;
  }

  public subscribeChannel(onMessage: (data: Message) => void) {
    const user = this.userManager.getUser();
    this.ws = new WebSocket(
      `ws://localhost:8080/api/canvas/channel${
        user ? `?userId=${user.id}` : ""
      }`
    );
    this.ws.onmessage = (event: MessageEvent) =>
      onMessage(JSON.parse(event.data) as Message);
  }

  public sendEvents(
    userId: string,
    canvasId: string,
    events: CanvasEventDto[]
  ) {
    this.ws.send(
      JSON.stringify({
        type: MessageTypes.event,
        canvasId,
        userId,
        data: events,
      } as Message)
    );
  }

  public sendCommand(userId: string, canvasId: string, command: Command) {
    this.ws.send(
      JSON.stringify({
        type: MessageTypes.command,
        canvasId,
        userId,
        command,
      } as Message)
    );
  }
}
