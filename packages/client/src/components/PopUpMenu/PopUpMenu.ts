import { EventListenerStore } from "../../services";
import { uniqueID } from "../../utils";
import { AbstractComponent } from "../AbstractComponent";

export type PopUpMenuItem = {
  value: string;
  text: string;
  divider?: boolean;
  onClick: (value: string) => void;
};

export interface Params {
  items: PopUpMenuItem[];
  containerId: string;
}

export class PopUpMenu extends AbstractComponent {
  private eventStore: EventListenerStore;
  private portalElement: HTMLElement;
  private backdropElement: HTMLElement;
  private menuItems: PopUpMenuItem[] = [];
  private id: string;
  private containerId: string;

  constructor({ items, containerId }: Params) {
    super();
    this.id = `pop-up-menu-${uniqueID()}`;
    this.containerId = containerId;
    this.menuItems = items;
    this.eventStore = new EventListenerStore();
    this.backdropElement = document.createElement("div");
    this.backdropElement.className = "pop-up-menu__backdrop";
    this.portalElement = document.getElementById("pop-up-menu__portal")!;
    this.portalElement.innerHTML += this.renderHtml(items);
    const containerElement = document.getElementById(this.containerId);
    containerElement?.classList.add("pop-up-menu__container");
    this.eventStore.addEventForId(
      containerId,
      "contextmenu",
      (event: MouseEvent): void => this.handleContextMenuEvent(event)
    );
    this.eventStore.addEventForId(
      containerId,
      "click",
      (event: MouseEvent): void => this.handleClickEvent(event)
    );
  }

  private handleContextMenuEvent(event: MouseEvent): void {
    event.preventDefault();
    const rect = this.portalElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const menuElement = document.getElementById(this.id)!;
    const containerElement = document.getElementById(this.containerId)!;
    menuElement.style.top = `${y}px`;
    menuElement.style.left = `${x}px`;
    menuElement.classList.remove("pop-up-menu--hidden");
    if (this.backdropElement.parentElement !== containerElement) {
      containerElement.appendChild(this.backdropElement);
    }
    this.eventStore.addEventForId(this.id, "click", (event: MouseEvent): void =>
      this.handleClickEvent(event)
    );
  }

  private handleClickEvent(event: MouseEvent): void {
    event.preventDefault();
    const menuElement = document.getElementById(this.id)!;
    const containerElement = document.getElementById(this.containerId)!;
    const isClickedOutside = !menuElement.contains(event.target as Node);
    if (!isClickedOutside) {
      const value = (event.target as HTMLElement)?.getAttribute("data-value");
      const selectedItem = this.menuItems.find((item) => item.value === value);
      selectedItem?.onClick(value!);
    }
    menuElement.classList.add("pop-up-menu--hidden");
    containerElement.removeChild(this.backdropElement);
    this.eventStore.removeEventsForId(this.id);
  }

  destroy(): void {
    this.eventStore.removeAllEvents();
    const menuElement = document.getElementById(this.id)!;
    menuElement.remove();
  }

  private renderHtml(items: PopUpMenuItem[]): string {
    return `
      <ul class="pop-up-menu pop-up-menu--hidden" id="${this.id}">
        ${items
          .map(
            (item: PopUpMenuItem) => `
          ${item.divider ? `<hr class="pop-up-menu__divider"></hr>` : ""}
          <li class="pop-up-menu__item" data-value="${item.value}">
            ${item.text}
          </li>`
          )
          .join("")} 
      </ul>
    `;
  }
}
