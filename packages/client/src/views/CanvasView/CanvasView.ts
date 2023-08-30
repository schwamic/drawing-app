import { PopUpMenu, InfoBox } from "../../components";
import { AbstractView, Params } from "../AbstractView";
import { uniqueID } from "../../utils";
import { ApiClient, UserManager } from "../../services";
import { Canvas, ToolArea } from "./components";
import { ToolTypes } from "./components/ToolArea/enums";
import { ShapeDto } from "@drawing-app/shared/build/dtos";
import { CanvasEventDto, Message, Shape, User } from "@drawing-app/shared/build/types";
import { CommandTypes, EventTypes, HTTPCodes, MessageTypes } from "@drawing-app/shared/build/enums";
import { CanvasActions, UpdatesFromCanvas } from "./components/Canvas/Canvas";

export class CanvasView extends AbstractView {
  private apiClient: ApiClient;
  private userManager: UserManager;
  private toolArea: ToolArea | undefined;
  private canvas: Canvas | undefined;
  private popUpMenu: PopUpMenu | undefined;
  private infoBox: InfoBox | undefined;
  private drawContainerId: string;
  private infoBoxId: string;

  constructor(params: Params) {
    super(params);
    this.apiClient = ApiClient.getInstance();
    this.userManager = UserManager.getInstance();
    this.drawContainerId = uniqueID();
    this.infoBoxId = uniqueID();
    this.setTitle(`Zeichenfläche (ID: ${params.id})`);
  }

  async onInit(): Promise<void> {
    // Handle visibility of InfoBox
    const { showInfo } = this.userManager.getSettings();
    if(showInfo){
      this.infoBox = new InfoBox(
        "Tipp",
        "Wählen Sie auf der rechten Seite Ihr Zeichenwerkzeug aus. Haben Sie eines ausgewählt, können Sie mit der Maus die entsprechenden Formen zeichen. Typischerweise, indem Sie die Maus drücken, dann mit gedrückter Maustaste die Form bestimmen, und dann anschließend die Maustaste loslassen.",
        this.infoBoxId
      );
      this.infoBox.onClose(() =>
      this.userManager.updateSettings({ showInfo: false })
    );
    } else {
      const infoElement = document.getElementById("info-container");
      infoElement?.classList.add("info--hidden");
    }
    
    // Manage communication between ToolArea, PopUpMenu and Canvas
    this.toolArea = new ToolArea();
    const initialSettings = this.toolArea.getSettings();
    this.canvas = new Canvas({ tool: initialSettings });
    this.popUpMenu = new PopUpMenu({
      containerId: this.drawContainerId,
      items: [
        {
          value: "foreground",
          text: "Vordergrund",
          onClick: () => this.canvas?.updateZOrder(true),
        },
        {
          value: "background",
          text: "Hintergrund",
          onClick: () => this.canvas?.updateZOrder(false),
        },
        {
          value: "delete",
          text: "Löschen",
          divider: true,
          onClick: () => this.canvas?.deleteSelection(),
        },
      ],
    });
    this.toolArea.onUpdate((settings) => {
      const canvasConfig = this.canvas?.getConfiguration();
      const toolTypeHasChanged =
        canvasConfig?.tool.toolType !== settings.toolType;
      if (toolTypeHasChanged) {
        this.canvas?.updateConfiguration({ tool: settings }, false);
        if (settings.toolType === ToolTypes.draw) {
          this.canvas?.unselectAll();
        }
      } else {
        this.canvas?.updateConfiguration({ tool: settings }, true);
      }
    });

    // Init Session
    this.canvas.onUpdateCallback((updates) => this.sendCanvasUpdates(updates));
    this.apiClient.subscribeChannel((data: any) => this.onMessage(data));
  }

  async onDestroy(): Promise<void> {
    const user = this.userManager.getUser();
    this.apiClient.sendEvents(user?.id, `${this.params.id}`, [
      { event: EventTypes.unregisterForCanvas } as CanvasEventDto,
    ]);
    this.toolArea?.destroy();
    this.canvas?.destroy();
    this.popUpMenu?.destroy();
    this.infoBox?.destroy();
  }

  private onMessage(message: Message): void {
    let user: User = this.userManager.getUser();
    let events: CanvasEventDto[];
    switch (message.type) {
      case MessageTypes.command:
        if (
          message.command === CommandTypes.connect &&
          message.status === HTTPCodes.OK
        ) {
          user = message.data as User;
          this.userManager.setUser(user);
          this.apiClient.sendEvents(user?.id, `${this.params.id}`, [
            { event: EventTypes.registerForCanvas } as CanvasEventDto,
          ]);
        }
        break;
      case MessageTypes.event:
        events = message.data as CanvasEventDto[];
        if (
          events.length === 1 &&
          events[0].event === EventTypes.registerForCanvas
        ) {
          this.canvas?.handleEvents(events, user?.id);
        }
        // Only handle events from other users
        else if (message.userId !== user?.id) {
          this.canvas?.handleEvents(events ?? []);
        }
        break;
      case MessageTypes.error:
        console.error(message);
        break;
      default:
        console.error(`Message with type ${message.type} is not supported!`);
    }
  }

  private sendCanvasUpdates(updates: UpdatesFromCanvas): void {
    const user = this.userManager.getUser();
    let isShape = false;
    updates.data.map((data) => {
      const events: CanvasEventDto[] = [];
      switch (updates.action) {
        case CanvasActions.addShape:
          events.push({
            event: EventTypes.addShape,
            shape: ShapeDto.fromData(data as Shape),
          } as CanvasEventDto);
          break;
        case CanvasActions.removeShapes:
          events.push({
            event: EventTypes.removeShape,
            shapeId: (data as Shape).id,
          } as CanvasEventDto);
          break;
        case CanvasActions.updateShapes:
        case CanvasActions.movePointer:
          isShape = updates.action === CanvasActions.updateShapes;
          events.push({
            event: isShape ? EventTypes.removeShape : EventTypes.removePointer,
            shapeId: (data as Shape).id,
          } as CanvasEventDto);
          events.push({
            event: isShape ? EventTypes.addShape : EventTypes.addPointer,
            shape: ShapeDto.fromData(data as Shape),
          } as CanvasEventDto);
          break;
        case CanvasActions.select:
          events.push({
            event: EventTypes.selectShape,
            shapeId: (data as Shape).id,
            user: this.userManager.getUser(),
          } as CanvasEventDto);
          break;
        case CanvasActions.unselect:
          events.push({
            event: EventTypes.unselectShape,
            shapeId: (data as Shape).id,
          } as CanvasEventDto);
          break;
        default:
          console.error(`CanvasAaction "${updates.action}" not supported!`);
      }
      this.apiClient.sendEvents(user.id, `${this.params.id}`, events);
    });
  }

  getHtml(): string {
    const title = `Zeichenfläche: (ID: ${this.params.id})`;
    return ` 
      <h1>${title}</h1>
      <nav class="navigation-container">
        <a href="/" data-link>< Zurück zur Übersicht</a>
      </nav>
      <div id="info-container">
        ${InfoBox.getHtml(this.infoBoxId)}
      </div>
      <div class="draw-container">
        <div class="draw-container__canvas" id="${this.drawContainerId}">
          ${Canvas.getHtml()}
        </div>
        <div class="draw-container__tool">
          ${ToolArea.getHtml()}
        </div>
      </div>
    `;
  }
}
