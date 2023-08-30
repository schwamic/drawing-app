export abstract class AbstractComponent {
  public abstract destroy(): void;
  public static getHtml(id?: string): string {
    return "";
  }
}
