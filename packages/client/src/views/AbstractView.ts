export interface Page {
  init(): Promise<void>;
  destroy(): Promise<void>;
  setTitle(title: string): void;
  getHtml(): string;
  onInit(): Promise<void>;
  onDestroy(): Promise<void>;
}

export type Params = {
  [key: string]: number | string;
};

export class AbstractView implements Page {
  public params: Params;
  private isInitExecuted = false;
  private isDestroyExecuted = false;

  constructor(params: Params) {
    this.params = params;
  }

  public setTitle(title: string): void {
    document.title = title;
  }

  public getHtml(): string {
    return "";
  }

  public async init(): Promise<void> {
    if (this.isInitExecuted) {
      return;
    }
    this.isInitExecuted = true;
    await this.onInit();
  }

  public async destroy(): Promise<void> {
    if (this.isDestroyExecuted) {
      return;
    }
    this.isDestroyExecuted = true;
    await this.onDestroy();
  }

  public async onInit(): Promise<void> {
    return;
  }

  public async onDestroy(): Promise<void> {
    return;
  }
}
