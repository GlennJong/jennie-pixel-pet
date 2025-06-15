import Phaser from 'phaser';
import { getGlobalData } from '../../../EventBus';

const DEFAULT_COIN = 888;

export class IconCoin extends Phaser.GameObjects.Container {
  private text: Phaser.GameObjects.Text;
  private value: number;

  constructor(scene: Phaser.Scene, option: { x: number, y: number }) {
    super(scene);

    this.value = typeof getGlobalData('tamagotchi_coin') !== 'undefined' ?
      getGlobalData('tamagotchi_coin')
      :
      DEFAULT_COIN;
    
    const { x, y } = option;

    // Icon
    const coin = scene.make.sprite({
      key: 'tamagotchi_header_icons',
      frame: 'coin-1',
      x: x,
      y: y,
    });
    if (!scene.anims.exists('coin')) {
      scene.anims.create({
        key: 'coin',
        frames: scene.anims.generateFrameNames('tamagotchi_header_icons', {
          prefix: `coin-`,
          start: 1,
          end: 16,
        }),
        repeat: -1,
        frameRate: 6,
      });
    }

    coin.play('coin');
    this.add(coin);

    const text = scene.make.text({
      x: x + 7,
      y: y - 4,
      style: { fontFamily: 'Tiny5', fontSize: 8, color: '#000' },
    });
    text.setResolution(4);

    this.text = text;
    this.add(text);

    this.text.setText(this.value.toString());
  }

  private targetValue?: number;

  public setValue(value: number) {
    const resultValue = value <= 0 ? 0 : value;
    this.targetValue = resultValue;
  }

  public addValue(value: number) {
    const sum = this.value + value;
    const resultValue = sum <= 0 ? 0 : sum;

    this.targetValue = resultValue;
  }

  public update() {
    if (typeof this.targetValue === 'undefined') return;

    if (this.targetValue > this.value) {
      this.value += 1;
    } else if (this.targetValue < this.value) {
      this.value -= 1;
    } else {
      this.targetValue = undefined;
    }

    this.text.setText(this.value.toString());
  }
}
