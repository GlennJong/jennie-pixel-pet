import Phaser from 'phaser';
import { getGlobalData, EventBus } from '../../../EventBus';

const DEFAULT_LEVEL = 1;

export class CustomDecroation extends Phaser.GameObjects.Container {
  private item: Phaser.GameObjects.Sprite;
  private currentLevel: number = 1;
  private maxLevel: number = 4;

  constructor(scene: Phaser.Scene) {
    // Inherite from scene
    super(scene);

    const { decoration } = scene.cache.json.get('config')['tamagotchi_room'];

    this.maxLevel = decoration.length;
    
    this.currentLevel = Math.min(this.maxLevel, getGlobalData('tamagotchi_level') || DEFAULT_LEVEL);

    // Item
    this.item = scene.make.sprite({
      key: decoration[this.currentLevel - 1].key,
      frame: decoration[this.currentLevel - 1].frame,
      x: 160 / 2,
      y: 144 / 2,
    });
    this.add(this.item);

    scene.add.existing(this);

    // Watch level change
    EventBus.on('tamagotchi_level-updated', (value) => {
      this.currentLevel = Math.min(this.maxLevel, value);
      this.item.setTexture(decoration[this.currentLevel - 1].key, decoration[this.currentLevel - 1].frame);
    });
  }

  public upgrade() {
    if (this.currentLevel <= this.maxLevel) {
      this.currentLevel += 1;
    }
  }
  public downgrade() {
    if (this.currentLevel >= 1) {
      this.currentLevel -= 1;
    }
  }
}
