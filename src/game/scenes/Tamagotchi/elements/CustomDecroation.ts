import Phaser from 'phaser';
import { store } from '@/game/store';

const DEFAULT_DECORATION_KEY = 'tamagotchi_room';
const DEFAULT_LEVEL = 1;

export class CustomDecroation extends Phaser.GameObjects.Container {
  private levelState = store<number>('tamagotchi.level');
  private item: Phaser.GameObjects.Sprite;
  private currentLevel: number = 1;
  private maxLevel: number = 4;
  private config = [];

  constructor(scene: Phaser.Scene) {
    // Inherite from scene
    super(scene);

    const key = DEFAULT_DECORATION_KEY;

    this.config = scene.cache.json.get('config').tamagotchi[key].decoration || [];

    this.maxLevel = this.config.length;
    
    this.currentLevel = Math.min(this.maxLevel, this.levelState?.get() || DEFAULT_LEVEL);

    // Item
    const { frame } = this.config[this.currentLevel - 1];
    this.item = scene.make.sprite({
      key,
      frame,
      x: 0,
      y: 0,
    }).setOrigin(0);

    
    this.add(this.item);
    
    this.scene.add.existing(this);
    
    // Watch level change
    this.levelState?.watch(this.handleLevelUpdate);
  }

  public init() {
    this.add(this.item);
  }

  private handleLevelUpdate = (value: number) => {
    this.currentLevel = Math.min(this.maxLevel, value);
    const { key, frame } = this.config[this.currentLevel - 1];
    this.item?.setTexture(key, frame);
  }

  public levelUp() {
    if (this.currentLevel < this.maxLevel) {
      this.levelState?.set(this.currentLevel + 1);
    }
  }

  public destroy() {
    this.item.destroy();
    this.levelState?.unwatchAll();
  }
}
