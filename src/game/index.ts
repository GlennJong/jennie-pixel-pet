import 'phaser';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

// Pulugins
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import BBCodeTextPlugin from 'phaser3-rex-plugins/plugins/bbcodetext-plugin.js';

declare module 'phaser' {
  interface Scene {
    rexUI: RexUIPlugin;
  }
}

// General
import { canvas } from './constants';

// Tamagotchi Scene
import Tamagotchi from './scenes/Tamagotchi';

// Battle Scene
import Battle from './scenes/Battle';
import { MainScene } from './scenes/MainScene';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: canvas.width,
  height: canvas.height,
  parent: 'game-container',
  zoom: 2,
  plugins: {
    global: [
      {
        key: 'rexBBCodeTextPlugin',
        plugin: BBCodeTextPlugin,
        start: true,
      },
    ],
    scene: [
      {
        key: 'rexUI',
        plugin: RexUIPlugin,
        mapping: 'rexUI',
        start: true,
      },
    ],
  },
  backgroundColor: '#000',
  canvasStyle: `display:block; image-rendering: pixelated`,
  scene: [
    Preloader,
    MainScene,
    Tamagotchi,
    Battle
  ],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
