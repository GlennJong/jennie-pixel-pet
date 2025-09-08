import Phaser from 'phaser';
import { store, getStoreState, setStoreState } from '@/game/store';
import { ConfigManager } from '@/game/managers/ConfigManagers';

const STORE_KEY = 'tamagotchi.hp';

const DEFAULT_CONSUMED_HP = 1;
const DEFAULT_RECOVER_HP = 33;
const DEFAULT_HP_DECREASE_INTERVAL = 1000;

const RETRY_MAX_TRY = 3;
const RETRY_DELAY = 1000;

export class StatusHandler {
  private timer?: Phaser.Time.TimerEvent;
  private scene: Phaser.Scene;
  private hpState = store<number>(STORE_KEY);
  private isAliveState = store<boolean>('tamagotchi.is_alive');
  private recover: number = DEFAULT_RECOVER_HP;
  private consume: number = DEFAULT_CONSUMED_HP;
  private interval: number = DEFAULT_HP_DECREASE_INTERVAL;
  private onFullHp?: () => void;
  private onZeroHp?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(params: { onFullHp?: () => void, onZeroHp?: () => void }) {
    const { onFullHp, onZeroHp } = params || {};

    // const { consume, recover, interval } = this.scene.cache.json.get('config').tamagotchi.tamagotchi_afk.base;
    // this.recover = typeof recover === 'number' ? recover : DEFAULT_RECOVER_HP;
    // this.consume = typeof consume === 'number' ? consume : DEFAULT_CONSUMED_HP;
    // this.interval = typeof interval === 'number' ? interval : DEFAULT_HP_DECREASE_INTERVAL;
    
    
    // this.hpState?.watch(this.handleHpChange);
    
    // if (onFullHp) this.onFullHp = onFullHp;
    // if (onZeroHp) this.onZeroHp = onZeroHp;

    // this.timer = this.scene.time.addEvent({
    //   delay: this.interval,
    //   loop: true,
    //   callback: () => {
    //     const isStopped = getStoreState('global.is_paused') || getStoreState('tamagotchi.is_sleep');
    //     if (isStopped) return;
    //     const currentHp = getStoreState('tamagotchi.hp') as number;
    //     const newHp = this.isAliveState?.get() ? this.consume*-1 : this.recover;
    //     const resultHp = Math.max(0, Math.min(100, currentHp + newHp));
        
    //     setStoreState('tamagotchi.hp', resultHp);
    //   }
    // });
    // this.handleHpChange(this.hpState?.get() || 0);
  }

  // private handleHpChange = async (currentHp: number) => {
  //   // 新增 retry 機制
  //   const retry = async (fn: (() => boolean) | undefined): Promise<boolean> => {
  //     for (let i = 0; i < RETRY_MAX_TRY; i++) {
  //       if (!fn) return true;
  //       const result = fn();
  //       if (result) return true;
  //       if (i < RETRY_MAX_TRY - 1) await new Promise(res => setTimeout(res, RETRY_DELAY));
  //     }
  //     return false;
  //   };
  //   if (currentHp === 100) {
  //     if (this.onFullHp && !this.isAliveState?.get()) {
  //       await retry(() => {
  //         const result = this.onFullHp?.();
  //         return typeof result === 'boolean' ? result : true;
  //       });
  //     }
  //   } else if (currentHp === 0) {
  //     if (this.onZeroHp) {
  //       await retry(() => {
  //         const result = this.onZeroHp?.();
  //         return typeof result === 'boolean' ? result : true;
  //       });
  //     }
  //   }
  // }

  public runEffect = (effect) => {
    const { status } = effect;
    if (status?.method === 'set') {
      const config = ConfigManager.getInstance().get('tamagotchi.afk2.statuses');
      const { is_alive, is_sleep } = config[status.value].conditions;
      setStoreState('tamagotchi.status', status.value);
      setStoreState('tamagotchi.is_alive', is_alive);
      setStoreState('tamagotchi.is_sleep', is_sleep);
    }
  }

  destroy() {
    this.hpState?.unwatchAll();
    if (this.timer) {
      this.timer.remove();
      this.timer = undefined;
    }
    this.onFullHp = undefined;
    this.onZeroHp = undefined;
  }
}
