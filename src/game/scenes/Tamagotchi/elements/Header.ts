import Phaser from 'phaser';

import { getStoreState, setStoreState } from '@/game/store';

// elements
import { HeaderSelector } from './HeaderSelector';
import { IconHp } from './HeaderHp';
import { IconCoin } from './HeaderCoin';

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 25;
const AUTO_HIDE_TIME = 10000;
const HEADER_DISPLAY_DURATION = 10000;

const SELECTORS = ['drink', 'battle', 'write', 'sleep'];
const DEFAULT_CHARACTER_KEY = 'tamagotchi_afk';

// TODO Constant Naming
export class Header extends Phaser.GameObjects.Container {
  private selectors = SELECTORS;
  public currentSelector: string = SELECTORS[0];

  private config;
  private iconSelector: { [key: string]: HeaderSelector } = {};
  private iconHp: IconHp;
  private iconCoin: IconCoin;
  private timer: number | undefined;

  
  constructor(scene: Phaser.Scene) {
    super(scene);

    this.config = scene.cache.json.get('config').tamagotchi[DEFAULT_CHARACTER_KEY].activities || {};

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
    this.iconSelector['drink'] = drink;

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
    this.iconSelector['battle'] = battle;

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
    this.iconSelector['write'] = write;

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
    this.iconSelector['sleep'] = sleep;

    this.iconHp = new IconHp(scene, { x: 100, y: 7 });
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

    Object.keys(this.iconSelector).map((_key) => {
      this.iconSelector[_key].unselect();
    });
    this.iconSelector[this.currentSelector].select();

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
    const currentIndex = this.selectors.indexOf(this.currentSelector);
    this.currentSelector =
      currentIndex !== this.selectors.length - 1
        ? this.selectors[currentIndex + 1]
        : this.selectors[0];
    this.handleUpdateSelector();
  }

  public movePrev() {
    const currentIndex = this.selectors.indexOf(this.currentSelector);
    this.currentSelector =
      currentIndex === 0
        ? this.selectors[this.selectors.length - 1]
        : this.selectors[currentIndex - 1];
    this.handleUpdateSelector();
  }

  public moveToSelector(selector: string) {
    this.currentSelector = selector;
    this.handleUpdateSelector();
  }

  public select() {
    const isSleep = getStoreState('tamagotchi.isSleep');

    // special condition
    if (isSleep && this.currentSelector === 'sleep') return 'awake';
    
    return this.currentSelector;
  }

  public runAction(action: string) {
    const { hp, coin } = this.config[action] || {};
    this.showHeader(HEADER_DISPLAY_DURATION);
    if (hp) setStoreState('tamagotchi.hp', getStoreState('tamagotchi.hp') + hp);
    if (coin) setStoreState('tamagotchi.coin', getStoreState('tamagotchi.coin') + coin);
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
