import {
  Shape,
  Point2D,
  Circle,
  Rectangle,
  Triangle,
  Line,
  User,
  Pointer,
  CanvasEventDto,
} from "@drawing-app/shared/build/types";
import { EventTypes, ShapeTypes } from "@drawing-app/shared/build/enums";
import { FillStates, ToolTypes } from "../ToolArea/enums";
import { Settings as ToolSettings } from "../ToolArea/types";
import { EventListenerStore, UserManager } from "../../../../services";
import { throttle } from "../../../../utils";
import { AbstractComponent } from "../../../../components";
import { ShapeFactory } from "./ShapeFactory";

const FPS = 32; // 1000/32 = 31.25 fps
const LEFT_CLICK = 0;

export interface Configuration {
  tool: ToolSettings;
}

export interface ShapeManager {
  updateConfiguration(
    config: Configuration,
    applyChangesOnSelection: boolean
  ): void;
  getConfiguration(): Configuration;
  updateZOrder(toForeground: boolean): void;
  deleteSelection(): void;
  unselectAll(): void;
}

export type UpdatesFromCanvas = {
  data: (Shape | Partial<Pointer> | string)[];
  action?: CanvasAction;
};

export type CanvasAction =
  | "select"
  | "unselect"
  | "movePointer"
  | "updateShapes"
  | "addShape"
  | "removeShapes";

export const CanvasActions: Record<CanvasAction, CanvasAction> = {
  select: "select",
  unselect: "unselect",
  movePointer: "movePointer",
  updateShapes: "updateShapes",
  addShape: "addShape",
  removeShapes: "removeShapes",
};


//TODO
export class Canvas extends AbstractComponent implements ShapeManager {
  private drawContext: CanvasRenderingContext2D;
  private createContext: CanvasRenderingContext2D;
  private userContext: CanvasRenderingContext2D;
  private utilContext: CanvasRenderingContext2D;
  private drawAreaElement: HTMLCanvasElement;
  private createAreaElement: HTMLCanvasElement;
  private userAreaElement: HTMLCanvasElement;
  private utilAreaElement: HTMLCanvasElement;
  private eventStore: EventListenerStore;
  private shapeFactory: ShapeFactory;
  private width: number;
  private height: number;
  private drawShapes: Record<string, Shape> = {};
  private createShapes: Record<string, Shape> = {};
  private userPointers: Record<string, Shape> = {};
  private selectedShapes: Record<string, Shape> = {};
  private clickedShapes: Shape[] = [];
  private blockedShapes: Record<string, Shape> = {};
  private shape2User: Record<string, string> = {};
  private users: Record<string, User> = {};
  private config: Configuration;
  private isMouseDown = false;
  private isCtrlKeyDown = false;
  private isAltKeyDown = false;
  private clickCounter = 0;
  private updateCallback!: (updates: UpdatesFromCanvas) => void;
  private userManager: UserManager;

  constructor(config: Configuration) {
    super();
    this.userManager = UserManager.getInstance();
    this.config = config;
    this.width = 920;
    this.height = 800;
    this.shapeFactory = new ShapeFactory();
    this.drawAreaElement = document.getElementById(
      "draw-area"
    ) as HTMLCanvasElement;
    this.createAreaElement = document.getElementById(
      "create-area"
    ) as HTMLCanvasElement;
    this.userAreaElement = document.getElementById(
      "user-area"
    ) as HTMLCanvasElement;
    this.utilAreaElement = document.getElementById(
      "util-area"
    ) as HTMLCanvasElement;
    this.drawContext = this.drawAreaElement.getContext("2d")!;
    this.createContext = this.createAreaElement.getContext("2d")!;
    this.userContext = this.userAreaElement.getContext("2d")!;
    this.utilContext = this.utilAreaElement.getContext("2d")!;
    this.eventStore = new EventListenerStore();
    this.eventStore.addEventForId(
      "draw-area",
      "mousedown",
      throttle((event: MouseEvent) => {
        this.onMouseDown(event);
      }, FPS)
    );
    this.eventStore.addEventForId(
      "draw-area",
      "mousemove",
      throttle((event: MouseEvent) => {
        this.onMouseMove(event);
      }, FPS)
    );
    this.eventStore.addEventForId(
      "draw-area",
      "mouseup",
      throttle((event: MouseEvent) => {
        this.onMouseUp(event);
      }, FPS)
    );
    this.eventStore.addEventForId(
      "document",
      "keydown",
      (event: KeyboardEvent) => this.onKeyDown(event)
    );
    this.eventStore.addEventForId("document", "keyup", (event: KeyboardEvent) =>
      this.onKeyUp(event)
    );
    this.eventStore.addEventForId(
      "draw-area",
      "mousemove",
      throttle((event: MouseEvent) => {
        const point = this.getCoordinates(event);
        const user = this.userManager.getUser();
        this.updateCallback({
          action: CanvasActions.movePointer,
          data: [
            this.shapeFactory.create({
              id: user.id,
              type: ShapeTypes.pointer,
              data: {
                point: point,
                fillColor: user.color,
              },
            }) as Shape,
          ],
        });
      }, FPS)
    );
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.key === "Control") {
      this.isCtrlKeyDown = true;
    } else if (event.key === "Alt") {
      this.isAltKeyDown = true;
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    this.clickCounter = 0;
    if (event.key === "Control") {
      this.isCtrlKeyDown = false;
    } else if (event.key === "Alt") {
      this.isAltKeyDown = false;
    }
  }

  private onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    if (event.button !== LEFT_CLICK) {
      return;
    }
    const coordinates = this.getCoordinates(event);
    this.isMouseDown = true;
    switch (this.config.tool.toolType) {
      case ToolTypes.draw:
        this.handleModeDraw("mousedown", coordinates);
        break;
      case ToolTypes.select:
        // skip
        break;
      case ToolTypes.move:
        this.handleModeMove("mousedown", coordinates);
        break;
    }
  }

  private onMouseMove(event: MouseEvent): void {
    event.preventDefault();
    const coordinates = this.getCoordinates(event);
    switch (this.config.tool.toolType) {
      case ToolTypes.draw:
        this.handleModeDraw("mousemove", coordinates);
        break;
      case ToolTypes.select:
        // skip
        break;
      case ToolTypes.move:
        this.handleModeMove("mousemove", coordinates);
        break;
    }
  }

  private onMouseUp(event: MouseEvent): void {
    event.preventDefault();
    const coordinates = this.getCoordinates(event);
    this.isMouseDown = false;
    switch (this.config.tool.toolType) {
      case ToolTypes.draw:
        this.handleModeDraw("mouseup", coordinates);
        break;
      case ToolTypes.select:
        this.handleModeSelect("mouseup", coordinates);
        break;
      case ToolTypes.move:
        this.handleModeMove("mouseup", coordinates);
        break;
    }
  }

  private handleModeDraw(state: string, coordinates: Point2D): void {
    if (state === "mousedown") {
      let newShape: Shape | undefined;
      switch (this.config.tool.shapeType) {
        case ShapeTypes.circle:
          newShape = this.shapeFactory.create(
            {
              type: this.config.tool.shapeType,
              data: {
                center: coordinates,
                radius: 2,
                borderColor: this.config.tool.color,
                fillColor:
                  this.config.tool.fill === FillStates.filled
                    ? this.config.tool.color
                    : undefined,
              } as Circle,
            },
            Object.values(this.drawShapes)
          ) as Shape;
          break;
        case ShapeTypes.rectangle:
        case ShapeTypes.triangle:
        case ShapeTypes.line:
          newShape = this.shapeFactory.create(
            {
              type: this.config.tool.shapeType,
              data: {
                from: coordinates,
                to: {
                  x: coordinates.x + 2,
                  y: coordinates.y + 2,
                },
                borderColor: this.config.tool.color,
                fillColor:
                  this.config.tool.fill === FillStates.filled
                    ? this.config.tool.color
                    : undefined,
              } as Rectangle | Triangle | Line,
            },
            Object.values(this.drawShapes)
          ) as Shape;
          break;
      }
      this.createShapes[`${newShape!.id}`] = newShape!;
      this.paintCreateArea();
    } else if (state === "mousemove") {
      if (this.isMouseDown) {
        const index = Object.keys(this.createShapes)[0];
        const shape = this.createShapes[index];
        switch (shape.type) {
          case ShapeTypes.circle:
            (shape.data as Circle).radius = this.shapeFactory.calculateRadius(
              (shape.data as Circle).center,
              coordinates
            );
            break;
          case ShapeTypes.rectangle:
          case ShapeTypes.triangle:
          case ShapeTypes.line:
            (shape.data as Line | Rectangle | Line).to = coordinates;
            break;
        }
        this.paintCreateArea();
      }
    } else if (state === "mouseup") {
      const index = Object.keys(this.createShapes)[0];
      const shape = this.createShapes[index];
      this.drawShapes[shape.id] = shape;
      this.createShapes = {};
      this.paintCreateArea();
      this.paintDrawArea();
      this.updateCallback({ action: CanvasActions.addShape, data: [shape] });
    }
  }

  private handleModeMove(state: string, coordinates?: Point2D): void {
    if (state === "mousemove" || state === "mousedown") {
      if (this.isMouseDown || state === "mousedown") {
        Object.values(this.selectedShapes).forEach((shape) =>
          shape.moveTo!(coordinates!)
        );
        this.paintDrawArea();
      }
    } else if (state === "mouseup") {
      this.updateCallback({
        action: CanvasActions.updateShapes,
        data: Object.values(this.selectedShapes),
      });
    }
  }

  private handleModeSelect(state: string, coordinates: Point2D): void {
    if (state === "mouseup") {
      const oldSelection = Object.values(this.selectedShapes);
      this.clickedShapes = Object.values(this.drawShapes)
        .filter((shape) => {
          this.utilContext.clearRect(0, 0, this.width, this.height);
          return shape.isPointInside!(this.utilContext, coordinates);
        })
        .filter((shape) => !this.blockedShapes[shape.id]);
      let index = 0;
      if (this.isAltKeyDown) {
        index = this.clickCounter % this.clickedShapes.length;
        this.clickCounter++;
      }
      const selectedShape = this.clickedShapes[index];
      if (selectedShape) {
        if (this.isCtrlKeyDown) {
          this.selectedShapes[selectedShape.id] = selectedShape;
        } else {
          this.selectedShapes = { [selectedShape.id]: selectedShape };
        }
      } else {
        this.selectedShapes = {};
      }
      this.paintDrawArea();
      this.updateCallback({
        action: CanvasActions.unselect,
        data: oldSelection.filter(
          (oldItem) =>
            !Object.values(this.selectedShapes).some(
              (item) => item.id === oldItem.id
            )
        ),
      });
      this.updateCallback({
        action: CanvasActions.select,
        data: Object.values(this.selectedShapes),
      });
    }
  }

  private paintDrawArea(): void {
    this.drawContext.clearRect(0, 0, this.width, this.height);
    Object.values(this.drawShapes)
      .filter((shape) => !!shape.draw)
      .sort((shapeA, shapeB) => shapeA.data.zOrder! - shapeB.data.zOrder!)
      .forEach((shape) => {
        if (this.blockedShapes[shape.id]) {
          shape.draw!(
            this.drawContext,
            true,
            this.users[this.shape2User[shape.id]]?.color ?? "255,0,0"
          );
        } else if (this.selectedShapes[shape.id]) {
          shape.draw!(this.drawContext, true);
        } else {
          shape.draw!(this.drawContext);
        }
      });
  }

  private paintCreateArea(): void {
    this.createContext.clearRect(0, 0, this.width, this.height);
    Object.values(this.createShapes).forEach((shape) => {
      if (shape.draw) {
        shape.draw(this.createContext);
      }
    });
  }

  private paintUserArea(): void {
    this.userContext.clearRect(0, 0, this.width, this.height);
    Object.values(this.userPointers).forEach((pointer) => {
      pointer.draw!(this.userContext);
    });
  }

  private getCoordinates(event: MouseEvent): Point2D {
    const rect = this.drawAreaElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.x,
      y: event.clientY - rect.y,
    };
  }

  handleEvents(eventsForCanvas: CanvasEventDto[], userId = "-1"): void {
    eventsForCanvas?.forEach((event: CanvasEventDto) => {
      let index: string;
      switch (event.event) {
        case EventTypes.addShape:
          index = event.shape!.id;
          this.drawShapes[index] = this.shapeFactory.create(
            event.shape!
          ) as Shape;
          this.paintDrawArea();
          break;
        case EventTypes.removeShape:
          index = event.shapeId!;
          delete this.drawShapes[index];
          this.paintDrawArea();
          break;
        case EventTypes.selectShape:
          index = event.shapeId!;
          this.shape2User[index] = event.userId;
          if (userId !== this.shape2User[index]) {
            this.blockedShapes[index] = this.drawShapes[index];
          } else {
            this.selectedShapes[index] = this.drawShapes[index];
          }
          this.paintDrawArea();
          break;
        case EventTypes.unselectShape:
          index = event.shapeId!;
          delete this.blockedShapes[index];
          delete this.selectedShapes[index];
          this.paintDrawArea();
          break;
        case EventTypes.addPointer:
          index = event.shape!.id;
          this.userPointers[index] = this.shapeFactory.create(event.shape!)!;
          this.paintUserArea();
          break;
        case EventTypes.removePointer:
          delete this.userPointers[event.shapeId!];
          this.paintUserArea();
          break;
        case EventTypes.registerForCanvas:
          this.users[`${event?.user?.id}`] = event.user!;
          break;
        case EventTypes.unregisterForCanvas:
          delete this.userPointers[`${event.userId}`];
          delete this.users[`${event.userId}`];
          this.paintUserArea();
          break;
        default:
          console.error(`Event with type "${event.event}" is not supported!`);
      }
    });
  }

  unselectAll(): void {
    this.handleModeSelect("mouseup", { x: -1, y: -1 });
  }

  deleteSelection(): void {
    this.updateCallback({
      action: CanvasActions.removeShapes,
      data: Object.values(this.selectedShapes),
    });
    Object.keys(this.selectedShapes).forEach(
      (key: string) => delete this.drawShapes[key]
    );
    this.selectedShapes = {};
    this.paintDrawArea();
  }

  updateConfiguration(
    config: Configuration,
    applyChangesOnSelection: boolean
  ): void {
    if (applyChangesOnSelection) {
      Object.values(this.selectedShapes).forEach((shape) => {
        shape.data.fillColor =
          config.tool.fill === FillStates.filled
            ? config.tool.color
            : undefined;
        shape.data.borderColor = config.tool.color;
      });
    }
    this.updateCallback({
      action: CanvasActions.updateShapes,
      data: Object.values(this.selectedShapes),
    });
    this.config = config;
    this.paintDrawArea();
  }

  updateZOrder(toForeground: boolean): void {
    Object.values(this.selectedShapes).forEach((shape) => {
      shape.data.zOrder = this.shapeFactory.createZOrder(
        Object.values(this.drawShapes),
        toForeground
      );
    });
    this.updateCallback({
      action: CanvasActions.updateShapes,
      data: Object.values(this.selectedShapes),
    });
    this.paintDrawArea();
  }

  onUpdateCallback(callback: (updates: UpdatesFromCanvas) => void): void {
    this.updateCallback = callback;
  }

  getConfiguration(): Configuration {
    return this.config;
  }

  destroy(): void {
    this.eventStore.removeAllEvents();
  }

  static getHtml(): string {
    return `
      <div class="canvas">
        <canvas class="draw-area" id="draw-area" width="920" height="800"></canvas>
        <canvas class="create-area" id="create-area" width="920" height="800"></canvas>
        <canvas class="user-area" id="user-area" width="920" height="800"></canvas>
        <canvas class="util-area" id="util-area" width="920" height="800"></canvas>
      </div>
      `;
  }
}
