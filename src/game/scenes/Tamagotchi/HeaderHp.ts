import Phaser from 'phaser';

type TOption = {
  x: number;
  y: number;
  value: number;
};

export class HeaderHp extends Phaser.GameObjects.Container {
  private icon: Phaser.GameObjects.Sprite;
  private text: Phaser.GameObjects.Text;
  private value: number;

  constructor(scene: Phaser.Scene, option: TOption) {
    // Inherite from scene
    super(scene);

    const { x, y, value } = option;

    this.value = value;

    // Icon
    const step = '25';
    const icon = scene.make.sprite({
      key: 'tamagotchi_header_icons',
      frame: 'hp-empty',
      x: x,
      y: y,
    });
    if (!scene.anims.exists('hp-100')) {
      scene.anims.create({
        key: 'hp-100',
        frames: scene.anims.generateFrameNames('tamagotchi_header_icons', {
          prefix: `hp-100-`,
          start: 1,
          end: 5,
        }),
        repeat: -1,
        frameRate: 6,
      });
    }
    
    if (!scene.anims.exists('hp-75')) {
      scene.anims.create({
        key: 'hp-75',
        frames: scene.anims.generateFrameNames('tamagotchi_header_icons', {
          prefix: `hp-75-`,
          start: 1,
          end: 5,
        }),
        repeat: -1,
        frameRate: 6,
      });
    }

    if (!scene.anims.exists('hp-50')) {
      scene.anims.create({
        key: 'hp-50',
        frames: scene.anims.generateFrameNames('tamagotchi_header_icons', {
          prefix: `hp-50-`,
          start: 1,
          end: 5,
        }),
        repeat: -1,
        frameRate: 6,
      });
    }

    if (!scene.anims.exists('hp-25')) {
      scene.anims.create({
        key: 'hp-25',
        frames: scene.anims.generateFrameNames('tamagotchi_header_icons', {
          prefix: `hp-25-`,
          start: 1,
          end: 5,
        }),
        repeat: -1,
        frameRate: 6,
      });
    }

    icon.play(`hp-${step}`);
    this.icon = icon;
    this.add(icon);

    // Text
    const text = scene.make.text({
      x: x + 6,
      y: y - 4,
      style: { fontFamily: 'Tiny5', fontSize: 8, color: '#000' },
      text: '',
    });
    text.setResolution(4);
    this.text = text;
    this.add(text);

    // Apply first
    this.applyIconAndValue();
  }

  private targetValue?: number;
  private step?: '100' | '75' | '50' | '25' | '10';

  private applyIconAndValue() {
    if (this.value > 75 && this.value <= 100 && this.step != '100') {
      this.icon.play(`hp-100`);
      this.step = '100';
    } else if (this.value > 50 && this.value <= 75 && this.step != '75') {
      this.icon.play(`hp-75`);
      this.step = '75';
    } else if (this.value > 25 && this.value <= 50 && this.step != '50') {
      this.icon.play(`hp-50`);
      this.step = '50';
    } else if (this.value > 10 && this.value <= 25 && this.step != '25') {
      this.icon.play(`hp-25`);
      this.step = '25';
    } else if (this.value <= 10 && this.step != '10') {
      this.icon.anims.complete();
      this.icon.setFrame('hp-empty');
      this.step = '10';
    }
    this.text.setText(this.value.toString());
  }

  public setValue(value: number) {
    // if (typeof this.targetValue !== 'undefined') return; // return when value still running

    const resultValue = value;
    this.targetValue = resultValue;
  }

  public addValue(value: number) {
    if (this.targetValue) return; // return when value still running

    const sum = this.value + value;
    const resultValue = sum;

    this.targetValue = resultValue;
  }

  public decreaseValue(value: number) {
    if (this.targetValue) return; // return when value still running

    const decrease = this.value - value;
    const resultValue = decrease;

    this.targetValue = resultValue;
  }

  public update() {
    if (typeof this.targetValue === 'undefined') return; // return when value still running

    if (this.targetValue > this.value) {
      this.value += 1;
    } else if (this.targetValue < this.value) {
      this.value -= 1;
    } else {
      this.targetValue = undefined;
    }
    this.applyIconAndValue();
  }
}
