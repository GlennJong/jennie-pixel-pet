import Phaser from "phaser";
import { store, getStoreState, setStoreState } from "@/game/store";

export type Coin = number;

const STORE_KEY = 'tamagotchi.hp';

const DEFAULT_CONSUMED_HP = 1;
const DEFAULT_RECOVER_HP = 33;

export class HpHandler {
  private timer?: Phaser.Time.TimerEvent;
  private scene: Phaser.Scene;
  private hpState = store<Coin>(STORE_KEY);
  private isAliveState = store<boolean>('tamagotchi.isAlive');
  private onFullHp?: () => void;
  private onZeroHp?: () => void;

  private onUpgrade?: (params: { coin: number}) => boolean | Promise<boolean>;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(params: { onFullHp?: () => void, onZeroHp?: () => void }) {
    const { onFullHp, onZeroHp } = params || {};

    this.hpState?.watch(this.handleHpChange);
    // this.onUpgrade = onUpgrade;
    // this.propertyList = this.scene.cache.json.get('config').tamagotchi.tamagotchi_room.decoration;
    if (onFullHp) this.onFullHp = onFullHp;
    if (onZeroHp) this.onZeroHp = onZeroHp;
    // this

    this.timer = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const isStopped = getStoreState('global.isPaused') || getStoreState('tamagotchi.isSleep');
        if (isStopped) return;
        const currentHp = getStoreState('tamagotchi.hp') as number;
        const newHp = this.isAliveState?.get() ? DEFAULT_CONSUMED_HP*-1 : DEFAULT_RECOVER_HP;
        const resultHp = Math.max(0, Math.min(100, currentHp + newHp));
        
        setStoreState('tamagotchi.hp', resultHp);
      }
    });
  }

  private handleHpChange = async (currentHp: Coin) => {
    if (currentHp === 100) {
      if (this.onFullHp) this.onFullHp();
      // setStoreState('tamagotchi.isAlive', false);
    } else if (currentHp === 0) {
      if (this.onZeroHp) this.onZeroHp();
      // setStoreState('tamagotchi.isAlive', false);
    }
    // const currentLevel: number = getStoreState('tamagotchi.level');

    // for(let i = 0; i < this.propertyList.length; i++) {
    //   const { cost, level } = this.propertyList[i];

    //   if (currentCoin >= cost && currentLevel < level) {
    //     // if (this.onUpgrade) this.onUpgrade({ coin: -1 * this.propertyList[i].cost });
    //     let upgradeSuccess = true;
    //     try {
    //       if (this.onUpgrade) {
    //         const result = await this.onUpgrade({
    //           coin: -1 * this.propertyList[i].cost
    //         });
    //         upgradeSuccess = !!result;
    //       }
    //     } catch (err) {
    //       upgradeSuccess = false;
    //       console.error('HpHandler upgrade failed:', err);
    //     }
    //     if (upgradeSuccess) {
    //       // setStoreState('tamagotchi.level', level);
    //       // setStoreState('tamagotchi.coin', currentCoin - cost);
    //     } else {
    //       // 處理失敗（可加提示、記錄等）
    //       console.warn('HpHandler: upgrade not successful, skip level/coin update.');
    //     }
    //     return; // stop loop
    //   }
    // }
  };

  destroy() {
    this.hpState?.unwatch(this.handleHpChange);
    if (this.timer) {
      this.timer.remove();
      this.timer = undefined;
    }
  }
}
