import Phaser from 'phaser';
import { HeaderSelector } from './Selector';
import { IconHp } from './Hp';
import { IconCoin } from './Coin';

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 25;
const AUTO_HIDE_TIME = 10000;

const selectors = ['drink', 'battle', 'write', 'sleep'];

// TODO Constant Naming
// const DRINK_ACTION_NAME = 'drink';
// const BATTLE_ACTION_NAME = 'battle';
// const WRITE_ACTION_NAME = 'write';
// const SLEEP_ACTION_NAME = 'sleep';
// const AWAKE_ACTION_NAME = 'awake';

export class Header extends Phaser.GameObjects.Container {
  public currentSelector: string = selectors[0];
  private selectors: { [key: string]: HeaderSelector } = {};
  private iconHp: IconHp;
  private iconCoin: IconCoin;
  private timer: number | undefined;

  constructor(scene: Phaser.Scene) {
    super(scene);

    // 2. background
    const background = scene.make
      .nineslice({
        key: 'tamagotchi_header_frame',
        frame: 'frame',
        width: DEFAULT_WIDTH,
        x: DEFAULT_WIDTH / 2,
        y: DEFAULT_HEIGHT / 2,
        height: DEFAULT_HEIGHT,
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
      x: 16,
      y: 7,
      start: 1,
      end: 5,
      freq: 4,
    });

    this.add(drink);
    this.selectors['drink'] = drink;

    const battle = new HeaderSelector(scene, {
      key: 'tamagotchi_header_icons',
      frame: 'battle',
      x: 36,
      y: 7,
      start: 1,
      end: 4,
      freq: 4,
    });

    this.add(battle);
    this.selectors['battle'] = battle;

    const write = new HeaderSelector(scene, {
      key: 'tamagotchi_header_icons',
      frame: 'write',
      x: 56,
      y: 7,
      start: 1,
      end: 5,
      freq: 4,
    });

    this.add(write);
    this.selectors['write'] = write;

    const sleep = new HeaderSelector(scene, {
      key: 'tamagotchi_header_icons',
      frame: 'sleep',
      x: 76,
      y: 7,
      start: 1,
      end: 2,
      freq: 1,
    });

    this.add(sleep);
    this.selectors['sleep'] = sleep;

    this.iconHp = new IconHp(scene, { x: 106, y: 7 });
    this.add(this.iconHp);

    this.iconCoin = new IconCoin(scene, { x: 126, y: 7 });
    this.add(this.iconCoin);

    this.currentSelector = 'drink';
    this.handleUpdateSelector();
  }

  private hideHeader() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.setAlpha(0);
    }, AUTO_HIDE_TIME);
  }

  private handleUpdateSelector() {
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

  public moveNext() {
    const currentIndex = selectors.indexOf(this.currentSelector);
    this.currentSelector =
      currentIndex !== selectors.length - 1
        ? selectors[currentIndex + 1]
        : selectors[0];
    this.handleUpdateSelector();
  }

  public movePrev() {
    const currentIndex = selectors.indexOf(this.currentSelector);
    this.currentSelector =
      currentIndex === 0
        ? selectors[selectors.length - 1]
        : selectors[currentIndex - 1];
    this.handleUpdateSelector();
  }

  public moveToSelector(selector: string) {
    this.currentSelector = selector;
    this.handleUpdateSelector();
  }

  public select() {
    return this.currentSelector;
  }

  public update() {
    this.iconHp.update();
    this.iconCoin.update();
  }

  public destroy() {
    this.iconHp.destroy();
    this.iconCoin.destroy();
    clearTimeout(this.timer);
  }

}
