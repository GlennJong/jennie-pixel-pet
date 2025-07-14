import Phaser from 'phaser';

type TOption = {
  x: number;
  y: number;
  start: number;
  end: number;
  freq: number;
  key: string;
  frame: string;
};

export class HeaderSelector extends Phaser.GameObjects.Container {
  private arrow: Phaser.GameObjects.Sprite;
  private icon: Phaser.GameObjects.Sprite;
  private frameName: string;

  constructor(scene: Phaser.Scene, option: TOption) {
    // Inherite from scene
    super(scene);

    const { x, y, key, frame, start, end, freq } = option;

    // Icon
    this.icon = scene.make.sprite({
      key: key,
      frame: `${frame}-default`,
      x: x,
      y: y,
    }).setOrigin(0);

    this.frameName = frame;

    // Defind Icon Animation
    if (!scene.anims.exists(`${frame}_anim`)) {
      scene.anims.create({
        key: `${frame}_anim`,
        frames: scene.anims.generateFrameNames(key, {
          prefix: `${frame}-`,
          start: start,
          end: end,
        }),
        repeat: -1,
        frameRate: freq,
      });
    }

    this.add(this.icon);

    // Arrow
    this.arrow = scene.make.sprite({
      key: 'tamagotchi_header_icons',
      frame: 'arrow',
      x: x - 12,
      y: y,
    }).setOrigin(0);

    // Defind Arrow Animation
    scene.tweens.add({
      targets: this.arrow,
      repeat: -1,
      yoyo: true,
      ease: 'linear',
      duration: 500,
      alpha: 0,
      pause: true,
    });

    this.arrow.visible = false;
    this.add(this.arrow);
  }

  public select() {
    this.arrow.visible = true;
    this.icon.play(`${this.frameName}_anim`);
  }

  public unselect() {
    this.arrow.visible = false;
    this.icon.anims.complete();
    this.icon.setFrame(`${this.frameName}-default`);
  }
}
