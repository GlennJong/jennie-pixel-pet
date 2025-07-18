import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    this.add.image(512, 384, 'background');
    // this.load.on('progress', (progress: number) => {
    //   // TODO: progress effect here
    // });
  }

  preload() {
    this.load.setPath('assets');

    // 只讀 localStorage，不再讀 window.globalConfig
    let customConfig: any = null;
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('custom_config');
        if (local) customConfig = JSON.parse(local);
      } catch {}
    }

    if (customConfig) {
      this.cache.json.add('config', customConfig);
      this._preloadAssetsFromConfig(customConfig);
    } else {
      // Main config json file
      this.load.json('config', 'config.json');
      this.load.on('filecomplete-json-config', (_key: unknown, _type: unknown, data) => {
        this._preloadAssetsFromConfig(data);
      });
    }

    // Preload Fonts
    this.load.font('BoutiqueBitmap', 'fonts/BoutiqueBitmap9x9.ttf', 'truetype');
    this.load.font('Tiny5', 'fonts/Tiny5-Regular.ttf', 'truetype');
  }

  _preloadAssetsFromConfig(data: any) {
    const { ui, battle, tamagotchi } = data;
    // Preload ui assets
    if (ui) {
      Object.keys(ui).map((key) => {
        this.load.atlas(
          ui[key].key,
          ui[key].preload.png,
          ui[key].preload.json,
        );
      });
    }
    // Preload tamagotchi assets
    if (tamagotchi) {
      Object.keys(tamagotchi).map((key) => {
        this.load.atlas(
          tamagotchi[key].key,
          tamagotchi[key].preload.png,
          tamagotchi[key].preload.json,
        );
      });
    }
    // Preload all battle characters
    if (battle) {
      Object.keys(battle).map((key) => {
        if (!battle[key].enabled) {
          this.load.atlas(
            battle[key].key,
            battle[key].preload.png,
            battle[key].preload.json,
          );
        }
      });
    }
  }

  create() {
    this.scene.start('Tamagotchi');
  }
}
