import { User } from "@drawing-app/shared/build/types";

const StorageKeys: Record<string, string> = {
  user: "user",
  settings: "user-settings",
};

export interface UserSettings {
  showInfo: boolean;
}

export class UserManager {
  private static instance: UserManager;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): UserManager {
    if (this.instance == null) {
      this.instance = new UserManager();
    }
    return this.instance;
  }

  public getUser(): User {
    return JSON.parse(localStorage.getItem(StorageKeys.user)) as User;
  }

  public setUser(user: User): void {
    localStorage.setItem(StorageKeys.user, JSON.stringify(user));
  }

  public updateSettings(settings: Partial<UserSettings>): void {
    const currentSettings = JSON.parse(
      localStorage.getItem(StorageKeys.settings)
    ) as UserSettings;
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(StorageKeys.settings, JSON.stringify(updatedSettings));
  }

  public getSettings(): UserSettings {
    const defaultSettings: UserSettings = {
      showInfo: true,
    };
    const settings = JSON.parse(
      localStorage.getItem(StorageKeys.settings)
    ) as UserSettings;
    return { ...defaultSettings, ...settings };
  }
}
