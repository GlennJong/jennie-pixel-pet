import Phaser from 'phaser';

const mapping = [
  { threshold: 20, frame: 'heart_1', flash: true },
  { threshold: 50, frame: 'heart_2', flash: false },
  { threshold: 75, frame: 'heart_3', flash: false },
  { threshold: 100, frame: 'heart_4', flash: false },
];

export class HeartBar extends Phaser.GameObjects.Container {
  private step: number | undefined;
  // private value: number;
  private sprite: Phaser.GameObjects.Sprite;
  private tween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const sprite = scene.make.sprite({
      key: 'heart',
      frame: 'heart_1',
    });

    const tween = scene.tweens.add({
      targets: sprite,
      repeat: -1,
      yoyo: true,
      ease: 'linear',
      duration: 500,
      alpha: 0,
      pause: true,
    });

    // Crrate sprite and tween
    this.sprite = sprite;
    this.tween = tween;

    // First update for init value
    this.add(sprite);
    scene.add.existing(this);
  }

  private handleDisplayFrame() {
    if (!this.step) return;
    const { frame, flash } = mapping[this.step];

    this.sprite.setFrame(frame);

    if (flash) {
      this.tween.resume();
    } else {
      this.tween.pause();
    }
  }

  public update(value: number) {
    const currentStep = mapping.findIndex((_item) => _item.threshold >= value);
    if (currentStep === this.step) return;
    this.step = currentStep;

    this.handleDisplayFrame();
  }
}
