import 'phaser';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

// General
import { canvas } from './constants';

// Tamagotchi Scene
import Tamagotchi from './scenes/Tamagotchi';

// Battle Scene
import Battle from './scenes/Battle';
import TestScene from './scenes/Test';
import { MainScene } from './scenes/MainScene';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: canvas.width,
  height: canvas.height,
  parent: 'game-container',
  // zoom: 2,
  backgroundColor: '#000',
  canvasStyle: `display:block; image-rendering: pixelated`,
  scene: [
    Preloader,
    MainScene,
    TestScene,
    Tamagotchi,
    Battle
  ],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
