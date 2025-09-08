import { store, getStoreState, setStoreState } from "@/game/store";
import Phaser from "phaser";

type PropertyItem = {
  key: string,
  frame: string,
  cost: number,
  level: number
}

const STORE_KEY = 'tamagotchi.coin';

const RETRY_MAX_TRY = 3;
const RETRY_DELAY = 1000;


export class PropertyHandler {
  private timer?: Phaser.Time.TimerEvent;
  private scene: Phaser.Scene;
  private coinState = store<number>(STORE_KEY);
  private propertyList: PropertyItem[] = [];

  private onUpgrade?: (params: { coin: number, level: number}) => boolean | Promise<boolean>;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(params: { onUpgrade?: (params: { coin: number}) => boolean | Promise<boolean> }) {
    const { onUpgrade } = params || {};

    this.coinState?.watch(this.handleCoinChange);
    this.onUpgrade = onUpgrade;
    this.propertyList = this.scene.cache.json.get('config').tamagotchi.tamagotchi_room.decoration;

  }

  private handleCoinChange = async (currentCoin: number) => {
    const currentLevel: number = getStoreState('tamagotchi.level');

    // 新增 retry 機制
    const retry = async (fn: (() => Promise<boolean> | boolean) | undefined): Promise<boolean> => {
      for (let i = 0; i < RETRY_MAX_TRY; i++) {
        if (!fn) return true;
        const result = await fn();
        if (result) return true;
        if (i < RETRY_MAX_TRY - 1) await new Promise(res => setTimeout(res, RETRY_DELAY));
      }
      return false;
    };

    for(let i = 0; i < this.propertyList.length; i++) {
      const { cost, level } = this.propertyList[i];

      if (currentCoin >= cost && currentLevel < level) {
        let upgradeSuccess = true;
        try {
          if (this.onUpgrade) {
            upgradeSuccess = await retry(() => {
              const result = this.onUpgrade!({ coin: -1 * this.propertyList[i].cost, level: this.propertyList[i].level });
              if (typeof result === 'boolean') return result;
              return Promise.resolve(result);
            });
          }
        } catch (err) {
          upgradeSuccess = false;
          console.error('PropertyHandler upgrade failed:', err);
        }
        if (!upgradeSuccess) {
          console.warn('PropertyHandler: upgrade not successful, skip level/coin update.');
        }
        return; // stop loop
      }
    }
  }

  public runEffect = (effect) => {
    const { coin } = effect;
    if (!coin) return;
    if (coin.method === 'add') {
      setStoreState(STORE_KEY, getStoreState(STORE_KEY) + coin.value);
    }
    else if (coin.method === 'sub') {
      setStoreState(STORE_KEY, Math.max(0, getStoreState(STORE_KEY) - coin.value));
    }
    else if (coin.method === 'set') {
      setStoreState(STORE_KEY, coin.value);
    }
  }

  destroy() {
    this.coinState?.unwatchAll();
    this.onUpgrade = undefined;
    if (this.timer) {
      this.timer.remove();
      this.timer = undefined;
    }
  }
}
