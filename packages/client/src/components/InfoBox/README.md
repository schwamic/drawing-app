# INFO BOX

"Info box" is a flexible component used to group and display informations in a clear and concise format.

**WARNING: At the moment the component has two dependencies: AbstractComponent and EventListenerStore!**

## How to use it

1. Integrate the info box in your project:

```html
<link rel="stylesheet" href="InfoBox.css" />
<body>
  <div id="app"></div>
  <script type="module" src="InfoBox.ts"></script>
</body>
```

2. Initialize the info box:

```ts
import { InfoBox } from "InfoBox.css";
app.innerHTML = InfoBox.getHtml("ID1234");
// Init the component
const infoBox = new InfoBox("title", "text", "ID1234");
// Handle if the close icon was clicked
infoBox.onClose((value: string) => handleClose(value));
// Remove all event listeners
infoBox.destroy();
```

3. If the user clicks on the close icon, the info box disappears.

## Interface

```ts
interface InfoBox {
  onClose(callback: () => void): void;
  destroy(): void;
  static getHtml(): string;
}
```
