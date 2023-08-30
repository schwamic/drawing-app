import { ShapeTypes } from "@drawing-app/shared/build/enums";
import { ShapeType } from "@drawing-app/shared/build/types/Shape.type";
import { EventListenerStore } from "../../../../services/EventListenerStore";
import { AbstractComponent } from "../../../../components";
import { Colors, FillStates, ToolTypes } from "./enums";
import { Color, ToolType, FillState, Settings } from "./types";
import { CircleSVG, LineSVG, RectangleSVG, TriangleSVG } from "./assets";

export interface ToolManager {
  onUpdate(callback: (settings: Settings) => void): void;
  setSettings(settings: Settings): void;
  getSettings(): Settings;
  destroy(): void;
}

export class ToolArea extends AbstractComponent implements ToolManager {
  private color: Color;
  private fill: FillState;
  private shapeType: ShapeType;
  private toolType: ToolType;
  private toolTypeEventStore: EventListenerStore;
  private fillEventStore: EventListenerStore;
  private colorEventStore: EventListenerStore;
  private shapeTypeEventStore: EventListenerStore;
  private updateCallback: ((settings: Settings) => void) | undefined;

  constructor() {
    super();
    this.color = "white";
    this.fill = "filled";
    this.shapeType = ShapeTypes.circle;
    this.toolType = ToolTypes.draw;
    this.toolTypeEventStore = new EventListenerStore();
    this.fillEventStore = new EventListenerStore();
    this.colorEventStore = new EventListenerStore();
    this.shapeTypeEventStore = new EventListenerStore();
    this.toolTypeEventStore.addEventForIds(
      Object.values(ToolTypes).map((tool) => `tool-${tool}`),
      "click",
      (event: MouseEvent) => this.select(event, "tool-type")
    );
    this.shapeTypeEventStore.addEventForIds(
      Object.values(ShapeTypes)
        .filter((shape) => shape !== ShapeTypes.pointer)
        .map((shape) => `shape-${shape}`),
      "click",
      (event: MouseEvent) => this.select(event, "shape-type")
    );
    this.colorEventStore.addEventForIds(
      Object.keys(Colors).map((color) => `color-${color}`),
      "click",
      (event: MouseEvent) => this.select(event, "color")
    );
    this.fillEventStore.addEventForIds(
      Object.values(FillStates).map((fill) => `fill-${fill}`),
      "click",
      (event: MouseEvent) => this.select(event, "fill-state")
    );
  }

  onUpdate(callback: (settings: Settings) => void): void {
    this.updateCallback = callback;
  }

  setSettings(settings: Settings): void {
    this.fill = settings.fill;
    this.color = settings.color;
    this.shapeType = settings.shapeType;
    this.toolType = settings.toolType;
    const fillElement = document.getElementById(`fill-${this.fill}`);
    const colorElement = document.getElementById(`color-${this.color}`);
    const shapeElement = document.getElementById(`shape-${this.shapeType}`);
    const typeElement = document.getElementById(`tool-${this.toolType}`);
    this.updateDataState(fillElement!, "fill-state");
    this.updateDataState(colorElement!, "color");
    this.updateDataState(shapeElement!, "shape-type");
    this.updateDataState(typeElement!, "tool-type");
  }

  getSettings(): Settings {
    return {
      toolType: this.toolType,
      shapeType: this.shapeType,
      color: this.color,
      fill: this.fill,
    };
  }

  destroy(): void {
    this.toolTypeEventStore.removeAllEvents();
    this.shapeTypeEventStore.removeAllEvents();
    this.colorEventStore.removeAllEvents();
    this.fillEventStore.removeAllEvents();
  }

  private select(event: MouseEvent, name: string): void {
    this.updateDataState(event.target!, name);
    const value = (event.target as HTMLElement).getAttribute("data-value");
    let hasChanged = false;
    switch (name) {
      case "tool-type":
        hasChanged = this.toolType !== value;
        this.toolType = value as ToolType;
        this.handleToolTypeChanged();
        break;
      case "shape-type":
        hasChanged = this.shapeType !== value;
        this.shapeType = value as ShapeType;
        break;
      case "color":
        hasChanged = this.color !== value;
        this.color = value as Color;
        break;
      case "fill-state":
        hasChanged = this.fill !== value;
        this.fill = value as FillState;
        break;
    }
    if (hasChanged) {
      this.notifySubscribers();
    }
  }

  private updateDataState(
    target: EventTarget | HTMLElement,
    name: string
  ): void {
    Array.from(document.getElementsByName(name)).forEach((element) => {
      element.removeAttribute("data-state");
    });
    (target as HTMLElement).setAttribute("data-state", "active");
  }

  private handleToolTypeChanged() {
    const shapeGroup = document.getElementById("shape-types");
    const colorGroup = document.getElementById("colors");
    const fillGroup = document.getElementById("fill-states");
    if (this.toolType === ToolTypes.move) {
      shapeGroup?.classList.add("tool-area-group--deactivated");
      colorGroup?.classList.add("tool-area-group--deactivated");
      fillGroup?.classList.add("tool-area-group--deactivated");
    } else if (this.toolType === ToolTypes.select) {
      shapeGroup?.classList.add("tool-area-group--deactivated");
      colorGroup?.classList.remove("tool-area-group--deactivated");
      fillGroup?.classList.remove("tool-area-group--deactivated");
    } else {
      shapeGroup?.classList.remove("tool-area-group--deactivated");
      colorGroup?.classList.remove("tool-area-group--deactivated");
      fillGroup?.classList.remove("tool-area-group--deactivated");
    }
  }

  private notifySubscribers(): void {
    if (!this.updateCallback) {
      return;
    }
    const settings: Settings = this.getSettings();
    this.updateCallback(settings);
  }

  static getHtml(): string {
    const toolTypes = Object.values(ToolTypes) as string[];
    const shapeTypes = Object.values(ShapeTypes).filter(
      (shape) => shape !== ShapeTypes.pointer
    );
    const colors = Object.keys(Colors);
    const fillState = Object.values(FillStates);
    const toolIcons = {
      [ToolTypes.move]: "move",
      [ToolTypes.select]: "mouse-pointer",
      [ToolTypes.draw]: "pen-tool",
    };
    const fillIcons = {
      [FillStates.filled]: "check",
      [FillStates.transparent]: "x",
    };
    const shapeIcons = {
      [ShapeTypes.rectangle]: RectangleSVG,
      [ShapeTypes.circle]: CircleSVG,
      [ShapeTypes.triangle]: TriangleSVG,
      [ShapeTypes.line]: LineSVG,
    };
    const isActive = (index: number): string => (index === 0 ? "active" : "");

    return `
      <div class="tool-area" id="tool-area">
        <div class="tool-area-group" id="tool-types">
          <h3>Aktionen</h3>
          ${toolTypes
            .map((tool, index) => {
              return `
            <div class="box" id="tool-${tool}" name="tool-type" data-value="${tool}" data-state="${isActive(
                index
              )}">
              <i class="feather-30 pointer-events-none" data-feather="${
                toolIcons[tool]
              }"></i>
            </div>
          `;
            })
            .join("")}
        </div> 
        <div class="tool-area-group" id="shape-types">
          <h3>Formen</h3>
          ${shapeTypes
            .map((shape, index) => {
              return `
            <div class="box" id="shape-${shape}" name="shape-type" data-value="${shape}" data-state="${isActive(
                index
              )}">
                ${shapeIcons[shape]}
            </div>
          `;
            })
            .join("")}
        </div>
        <div class="tool-area-group" id="colors">
          <h3>Farben</h3>
          ${colors
            .map((color, index) => {
              return `
            <div class="box" id="color-${color}" name="color" data-value="${color}" data-state="${isActive(
                index
              )}">
              <div class="color color--${color} pointer-events-none"></div>
            </div>
          `;
            })
            .join("")}
        </div>
        <div class="tool-area-group" id="fill-states">
          <h3>Füllung</h3>
          ${fillState
            .map((state, index) => {
              return `
            <div class="box" id="fill-${state}" name="fill-state" data-value="${state}" data-state="${isActive(
                index
              )}">
              <i class="feather-30 pointer-events-none" data-feather="${
                fillIcons[state]
              }"></i>
            </div>
          `;
            })
            .join("")}
        </div>
      </div>
    `;
  }
}
