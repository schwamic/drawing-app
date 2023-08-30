import { Event } from "../types";

export const EventTypes: Record<Event, Event> = {
  addPointer: "addPointer",
  removePointer: "removePointer",
  addShape: "addShape",
  removeShape: "removeShape",
  selectShape: "selectShape",
  unselectShape: "unselectShape",
  unregisterForCanvas: "unregisterForCanvas",
  registerForCanvas: "registerForCanvas",
};
