import Phaser from 'phaser';
import { canvas } from '../../constants';
import { HeaderSelector } from './HeaderSelector';
import { HeaderHp } from './HeaderHp';
import { HeaderCoin } from './HeaderCoin';

const defaultWidth = canvas.width;
const defaultHeight = 25;
const AUTO_HIDE_TIME = 10000;

const selectors = ['drink', 'battle', 'write', 'sleep'];

export class Header extends Phaser.GameObjects.Container {
  public currentSelector: string = selectors[0];
  private selectors: { [key: string]: HeaderSelector } = {};
  private hp: HeaderHp;
  private coin: HeaderCoin;
  private timer: number | undefined;

  constructor(scene: Phaser.Scene) {
    // 1. Inherite from scene
    super(scene);

    // 2. background
    const background = scene.make
      .nineslice({
        key: 'tamagotchi_header_frame',
        frame: 'frame',
        width: defaultWidth,
        x: defaultWidth / 2,
        y: defaultHeight / 2,
        height: defaultHeight,
        leftWidth: 8,
        rightWidth: 8,
        topHeight: 8,
        bottomHeight: 8,
      })
      .setOrigin(0.5);
    this.add(background);

    // 3. defined button
    const drink = new HeaderSelector(scene, {
      key: 'tamagotchi_header_icons',
      frame: 'drink',
      x: 20,
      y: 13,
      start: 1,
      end: 5,
      freq: 4,
    });

    this.add(drink);
    this.selectors['drink'] = drink;

    const battle = new HeaderSelector(scene, {
      key: 'tamagotchi_header_icons',
      frame: 'battle',
      x: 40,
      y: 13,
      start: 1,
      end: 4,
      freq: 4,
    });

    this.add(battle);
    this.selectors['battle'] = battle;

    const write = new HeaderSelector(scene, {
      key: 'tamagotchi_header_icons',
      frame: 'write',
      x: 60,
      y: 13,
      start: 1,
      end: 5,
      freq: 4,
    });

    this.add(write);
    this.selectors['write'] = write;

    const sleep = new HeaderSelector(scene, {
      key: 'tamagotchi_header_icons',
      frame: 'sleep',
      x: 79,
      y: 13,
      start: 1,
      end: 2,
      freq: 1,
    });

    this.add(sleep);
    this.selectors['sleep'] = sleep;

    const hp = new HeaderHp(scene, { x: 106, y: 13, value: 0 });
    this.hp = hp;
    this.add(hp);

    const coin = new HeaderCoin(scene, { x: 134, y: 13, value: 0 });
    this.coin = coin;
    this.add(coin);

    scene.add.existing(this); // board

    this.currentSelector = 'drink';
    this.updateSelector();
  }

  private hideHeader() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.setAlpha(0);
    }, AUTO_HIDE_TIME);
  }

  private updateSelector() {
    this.setAlpha(1);

    Object.keys(this.selectors).map((_key) => {
      this.selectors[_key].unselect();
    });
    this.selectors[this.currentSelector].select();

    this.hideHeader();
  }

  public showHeader(time?: number) {
    this.setAlpha(1);
    if (time) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.setAlpha(0);
      }, time);
    }
    
  }

  public moveToNextSelector() {
    const currentIndex = selectors.indexOf(this.currentSelector);
    this.currentSelector =
      currentIndex !== selectors.length - 1
        ? selectors[currentIndex + 1]
        : selectors[0];
    this.updateSelector();
  }

  public moveToPreviousSelector() {
    const currentIndex = selectors.indexOf(this.currentSelector);
    this.currentSelector =
      currentIndex === 0
        ? selectors[selectors.length - 1]
        : selectors[currentIndex - 1];
    this.updateSelector();
  }

  public moveToSelector(string: string) {
    this.currentSelector = string;
    this.updateSelector();
  }

  public addHp(value: number) {
    this.hp.addValue(value);
  }
  public reduceHp(value: number) {
    this.hp.decreaseValue(value);
  }
  public addCoin(value: number) {
    this.coin.addValue(value);
  }

  public setValue({ hp, coin }: { hp?: number; coin?: number }) {
    if (typeof hp !== 'undefined') {
      this.hp.setValue(hp);
    }
    if (typeof coin !== 'undefined') {
      this.coin.setValue(coin);
    }
  }

  public statusHandler() {
    this.hp.update();
    this.coin.update();
  }

  // public TODO: auto hide
}
