// src/game/services/ConfigManager.ts
export class ConfigManager {
  private static instance: ConfigManager;
  private config: any = {};

  private constructor() {}


  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  setConfig(config: any) {
    this.config = config;
  }

  async loadConfig(url: string) {
    const res = await fetch(url);
    this.config = await res.json();
  }

  get(path: string) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }
}