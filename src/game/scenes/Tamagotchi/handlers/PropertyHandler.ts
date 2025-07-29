import { store, getStoreState } from "@/game/store";
import Phaser from "phaser";

type PropertyItem = {
  key: string,
  frame: string,
  cost: number,
  level: number
}

const STORE_KEY = 'tamagotchi.coin';

export class PropertyHandler {
  private timer?: Phaser.Time.TimerEvent;
  private scene: Phaser.Scene;
  private coinState = store<number>(STORE_KEY);
  private propertyList: PropertyItem[] = [];

  private onUpgrade?: (params: { coin: number}) => boolean | Promise<boolean>;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(params: { onUpgrade?: (params: { coin: number}) => boolean | Promise<boolean> }) {
    const { onUpgrade } = params || {};

    this.coinState?.watch(this.handleCoinChange.bind(this));
    this.onUpgrade = onUpgrade;
    this.propertyList = this.scene.cache.json.get('config').tamagotchi.tamagotchi_room.decoration;

  }

  private async handleCoinChange(currentCoin: number) {
    const currentLevel: number = getStoreState('tamagotchi.level');

    for(let i = 0; i < this.propertyList.length; i++) {
      const { cost, level } = this.propertyList[i];

      if (currentCoin >= cost && currentLevel < level) {
        let upgradeSuccess = true;
        try {
          if (this.onUpgrade) {
            const result = await this.onUpgrade({
              coin: -1 * this.propertyList[i].cost
            });
            upgradeSuccess = !!result;
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

  destroy() {
    this.coinState?.unwatch(this.handleCoinChange);
    if (this.timer) {
      this.timer.remove();
      this.timer = undefined;
    }
  }
}
