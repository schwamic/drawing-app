import { EventListenerStore } from "../../services/EventListenerStore";
import { AbstractComponent } from "../AbstractComponent";

export class InfoBox extends AbstractComponent {
  private eventListenerStore: EventListenerStore;
  private closeCallback: any;
  private id: string;

  constructor(title: string, text: string, id: string) {
    super();
    this.id = id;
    document.getElementById(`title-${this.id}`)!.innerHTML = title;
    document.getElementById(`text-${this.id}`)!.innerHTML = text;
    this.eventListenerStore = new EventListenerStore();
    this.eventListenerStore.addEventForId(`btn-${this.id}`, "click", () =>
      this.handleClose()
    );
  }

  private handleClose(): void {
    this.eventListenerStore.removeAllEvents();
    document.getElementById(this.id)?.remove();
    this.closeCallback();
  }

  public onClose(callback: () => void): void {
    this.closeCallback = callback;
  }

  public destroy(): void {
    this.eventListenerStore.removeAllEvents();
  }

  static getHtml(id: string): string {
    return ` 
      <div id="${id}" class="info-box">
        <i id="btn-${id}" class="info-box__close-btn" data-feather="x"></i>
        <h3 id="title-${id}" class="info-box__title"></h3>
        <p id="text-${id}" class="info-box__text"></p>
      </div>
    `;
  }
}
