import { ApiClient, EventListenerStore } from "../../services";
import { AbstractView, Params } from "../AbstractView";
import { GetCanvasListResponse } from "@drawing-app/shared/build/types";

export class OverView extends AbstractView {
  private rooms: GetCanvasListResponse = [];
  private apiClient: ApiClient;
  private eventListenerStore: EventListenerStore;

  constructor(params: Params) {
    super(params);
    this.setTitle("Übersicht");
    this.apiClient = ApiClient.getInstance();
    this.eventListenerStore = new EventListenerStore();
  }

  async onInit(): Promise<void> {
    this.rooms = await this.apiClient.getCanvasList();
    this.renderListOfRooms();
    this.eventListenerStore.addEventForId(
      "create-draw-area-btn",
      "click",
      (event: MouseEvent) => this.onCreateNewDrawArea(event)
    );
  }

  async onDestroy(): Promise<void> {
    this.eventListenerStore.removeAllEvents();
  }

  private async onCreateNewDrawArea(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const response = await this.apiClient.createCanvas();
    window.router.navigateTo(`canvas/${response.canvasId}`);
  }

  private renderListOfRooms(): void {
    const canvasList = document.getElementById("canvas-list");
    canvasList!.innerHTML = this.rooms
      .map(
        (room) =>
          `<li>
            <a href="/canvas/${room}" data-link> Zeichenfläche (ID: ${room})</a>
          </li>`
      )
      .join("");
  }

  getHtml(): string {
    return `
      <h1>Einfaches Zeichenprogramm 🎨</h1>
      <h2>Zeichenfläche beitreten</h2>
      <ul id="canvas-list"></ul>
      <button id="create-draw-area-btn">Neue Zeichenfläche anlegen</button>
    `;
  }
}
