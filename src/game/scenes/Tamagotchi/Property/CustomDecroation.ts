import Phaser from 'phaser';
import { getGlobalData, EventBus } from '../../../EventBus';

const DEFAULT_LEVEL = 1;

export class CustomDecroation extends Phaser.GameObjects.Container {
  private item: Phaser.GameObjects.Sprite;
  private currentLevel: number = 1;
  private maxLevel: number = 4;
  private config = undefined;

  constructor(scene: Phaser.Scene) {
    // Inherite from scene
    super(scene);

    this.config = scene.cache.json.get('config')['tamagotchi_room'].decoration;

    this.maxLevel = this.config.length;
    
    this.currentLevel = Math.min(this.maxLevel, getGlobalData('tamagotchi_level') || DEFAULT_LEVEL);

    // Item
    this.item = scene.make.sprite({
      key: this.config[this.currentLevel - 1].key,
      frame: this.config[this.currentLevel - 1].frame,
      x: 160 / 2,
      y: 144 / 2,
    });
    this.add(this.item);

    scene.add.existing(this);

    // Watch level change
    EventBus.on('tamagotchi_level-updated', this.handleLevelUpdate);
  }

  private handleLevelUpdate = (value: number) => {
    this.currentLevel = Math.min(this.maxLevel, value);
    this.item.setTexture(this.config[this.currentLevel - 1].key, this.config[this.currentLevel - 1].frame);
  }

  public destroy() {
    this.item.destroy();
    EventBus.off('tamagotchi_level-updated', this.handleLevelUpdate);
  }
}
