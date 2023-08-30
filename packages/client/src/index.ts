import { Router } from "./services";

async function main(): Promise<void> {
  window.router = Router.getInstance();
  window.app = document.querySelector("#app");
}

main();
