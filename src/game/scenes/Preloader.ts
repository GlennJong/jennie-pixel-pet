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

    // Main config json file
    this.load.json('config', 'config.json');

    // Preload Fonts
    this.load.font('BoutiqueBitmap', 'fonts/BoutiqueBitmap9x9.ttf', 'truetype');
    this.load.font('Tiny5', 'fonts/Tiny5-Regular.ttf', 'truetype');
    
    this.load.on('filecomplete-json-config', (_key: unknown, _type: unknown, data) => {
      const { ui, battle, tamagotchi } = data;
      
      // Preload ui assets
      Object.keys(ui).map((key) => {
        this.load.atlas(
          ui[key].key,
          ui[key].preload.png,
          ui[key].preload.json,
        );
      });

      // Preload ui assets
      Object.keys(tamagotchi).map((key) => {
        this.load.atlas(
          tamagotchi[key].key,
          tamagotchi[key].preload.png,
          tamagotchi[key].preload.json,
        );
      });

      // Preload all battle characters
      Object.keys(battle).map((key) => {
        if (!battle[key].enabled) {
          this.load.atlas(
            battle[key].key,
            battle[key].preload.png,
            battle[key].preload.json,
          );
        }
      });

    });
  }

  create() {
    this.scene.start('Tamagotchi');
  }
}
