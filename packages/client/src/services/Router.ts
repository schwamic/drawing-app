import * as feather from "feather-icons";
import { CanvasView, OverView } from "../views";
import { Page, Params } from "../views/AbstractView";

// Inspiration:
// https://dcode.domenade.com/tutorials/build-a-single-page-app-with-javascript-no-frameworks

type Route = {
  path: string;
  page: unknown;
};

type RouteObject = {
  route: Route;
  match: RegExpMatchArray | null;
};

export class Router {
  private static instance: Router;
  private currentPage: Page | undefined = undefined;
  private routes: Route[] = [
    { path: "/", page: OverView }, // default
    { path: "/canvas:id", page: CanvasView },
  ];

  private constructor() {
    window.addEventListener("popstate", () => this.renderPage());
    document.addEventListener("DOMContentLoaded", () => {
      document.body.addEventListener("click", (event: MouseEvent) => {
        if (event.target!.matches("[data-link]")) {
          event.preventDefault();
          this.navigateTo(event.target.href);
        }
      });
      this.renderPage();
    });
  }

  public static getInstance(): Router {
    if (this.instance == null) {
      this.instance = new Router();
    }
    return this.instance;
  }

  public async navigateTo(url: string): Promise<void> {
    history.pushState(null, "", url);
    await this.renderPage();
  }

  /**
   * Lifecycle Methodes
   * 1. getHtml: Html of page which should be rendered
   * 2. onInit: Initialize the page
   * 3. onDestroy: Cleanup e.g. disconnect from websocket
   */
  public async renderPage(): Promise<void> {
    if (this.currentPage != null) {
      await this.currentPage.destroy();
    }
    const routeObject = this.getRouteObjectFromUrl();
    const params: Params = this.getParams(routeObject);
    this.currentPage = new routeObject.route.page(params) as Page;
    window.app.innerHTML = this.currentPage.getHtml();
    feather.replace();
    await this.currentPage.init();
  }

  private pathToRegex(path: string): RegExp {
    return new RegExp(
      `^${path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)")}$`
    );
  }

  private getParams(routerObject: RouteObject) {
    const values = (routerObject.match ?? [])
      .slice(1)
      .map((value) => value.substring(1));
    const keys = Array.from(routerObject.route.path.matchAll(/:(\w+)/g)).map(
      (match) => match[1]
    );

    return Object.fromEntries(
      keys.map((key, i) => {
        return [key, values[i]];
      })
    );
  }

  private getRouteObjectFromUrl(): RouteObject {
    let result: RouteObject | undefined = this.routes
      .map((route) => ({
        route: route,
        match: location.pathname.match(this.pathToRegex(route.path)),
      }))
      .find((potentialMatch) => potentialMatch.match !== null);

    if (!result) {
      result = {
        route: this.routes[0],
        match: [location.pathname],
      };
    }
    return result;
  }
}
