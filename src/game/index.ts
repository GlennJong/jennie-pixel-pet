import 'phaser';
import { AUTO, Game } from 'phaser';
import { Preloader } from '@/game/scenes/Preloader';

// General
import { canvas } from '@/game/constants';

// Tamagotchi Scene

// Battle Scene
import Battle from '@/game/scenes/Battle';
import Tamagotchi from '@/game/scenes/Tamagotchi/scenes/Main';
import TestScene from '@/game/scenes/Test';
import { MainScene } from '@/game/scenes/MainScene';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: canvas.width,
  height: canvas.height,
  parent: 'game-container',
  zoom: 2,
  backgroundColor: '#000',
  canvasStyle: `display:block; image-rendering: pixelated; transform: scale(0.5); transform-origin: top left;`,
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
