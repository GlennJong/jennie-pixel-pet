import 'phaser';
import { GameOver } from './scenes/GameOver';
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
import TamagotchiRoom from './scenes/Tamagotchi/Room';

// Battle Scene
import Battle from './scenes/Battle';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  // type: Phaser.WEBGL,
  width: canvas.width,
  height: canvas.height,
  parent: 'game-container',
  // scale: {
  //     width: canvas.width,
  //     height: canvas.height,
  //     // parent: 'core',
  //     // fullscreenTarget: 'core',
  //     autoCenter: Phaser.Scale.CENTER_BOTH,
  //     mode: Phaser.Scale.FIT,
  // },
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
    Tamagotchi,
    TamagotchiRoom,
    Battle,
    GameOver,
  ],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
