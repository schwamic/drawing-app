type Callback = (params: any) => void | Promise<void>;

interface ElementStoreItem {
  callback: Callback;
  eventType: string;
}

export class EventListenerStore {
  private eventStore: Record<string, ElementStoreItem[]> = {};

  addEventForId(id: string, eventType: string, callback: Callback): void {
    if (id !== "document") {
      this.addEventListenerToElement(id, eventType, callback);
    } else {
      document.addEventListener(eventType, callback, false);
    }
    if (this.eventStore[id]) {
      this.eventStore[id].push({ callback, eventType });
    } else {
      this.eventStore[id] = [{ callback, eventType }];
    }
  }

  addEventForIds(ids: string[], eventType: string, callback: Callback): void {
    ids.forEach((id) => {
      this.addEventForId(id, eventType, callback);
    });
  }

  removeAllEvents(): void {
    Object.keys(this.eventStore).forEach((key) => this.removeEventsForId(key));
  }

  removeEventsForId(id: string): void {
    const items = this.eventStore[id];
    if (items) {
      items.forEach((item) => {
        if (id !== "document") {
          this.removeEventListenerFromElement(
            id,
            item.eventType,
            item.callback
          );
        } else {
          document.removeEventListener(item.eventType, item.callback);
        }
      });
      delete this.eventStore[id];
    }
  }

  private addEventListenerToElement(
    selector: string,
    eventType: string,
    callback: Callback
  ): HTMLElement {
    const element = document.getElementById(selector);
    element!.addEventListener(eventType, callback, false);
    return element!;
  }

  private removeEventListenerFromElement(
    selector: string,
    eventType: string,
    callback: Callback
  ) {
    const element = document.getElementById(selector);
    element!.removeEventListener(eventType, callback, false);
  }
}
