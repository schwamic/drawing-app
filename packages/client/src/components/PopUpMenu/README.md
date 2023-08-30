# POP UP MENU

Alternatively called a "context menu", a "pop up menu" is a menu that is hidden and doesn't appear until you right click.

**WARNING: At the moment the component has two dependencies: AbstractComponent and EventListenerStore!**

## How to use it

1. Integrate the pop up menu in your project:

```html
<link rel="stylesheet" href="PopUpMenu.css" />
<body>
  <!-- The appId forms the interactive frame -->
  <div id="appId"></div>
  <!-- The portal utility contains the PopUpMenu dom instances -->
  <div id="pop-up-menu__portal"></div>
  <script type="module" src="PopUpMenu.ts"></script>
</body>
```

2. Initialize the pop up menu:

```ts
import { PopUpMenu, PopUpMenuItem } from "PopUpMenu.css";
// Create the list of items of the pop up menu
const items: PopUpMenuItem[] = [
  { value: "one", text: "One", onClick: () => {} },
  { value: "two", text: "Two", onClick: () => {} },
  { value: "three", text: "Three", onClick: () => {}, divider: true },
];
// Init the component and add the interactive context area (e.g. appID)
const menu = new PopUpMenu({ items, containerId: "appID" });
// Remove pop up menu from dom and all event listeners
menu.destroy();
```

3. If the user right clicks inside the container (e.g. "appID"), the pop up menu is displayed at mouse position.
