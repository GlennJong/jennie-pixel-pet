import Phaser from "phaser";
import { store, getStoreState, setStoreState } from "@/game/store";

const STORE_KEY = 'tamagotchi.hp';

const DEFAULT_CONSUMED_HP = 1;
const DEFAULT_RECOVER_HP = 33;
const HP_DECREASE_INTERVAL = 1000;

export class HpHandler {
  private timer?: Phaser.Time.TimerEvent;
  private scene: Phaser.Scene;
  private hpState = store<number>(STORE_KEY);
  private isAliveState = store<boolean>('tamagotchi.isAlive');
  private onFullHp?: () => void;
  private onZeroHp?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(params: { onFullHp?: () => void, onZeroHp?: () => void }) {
    const { onFullHp, onZeroHp } = params || {};

    this.hpState?.watch(this.handleHpChange);
    
    if (onFullHp) this.onFullHp = onFullHp;
    if (onZeroHp) this.onZeroHp = onZeroHp;

    this.timer = this.scene.time.addEvent({
      delay: HP_DECREASE_INTERVAL,
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
  private handleHpChange = (currentHp: number) => {
    if (currentHp === 100) {
      if (this.onFullHp) this.onFullHp();
    } else if (currentHp === 0) {
      if (this.onZeroHp) this.onZeroHp();
    }
  };

  destroy() {
    this.hpState?.unwatch(this.handleHpChange);
    if (this.timer) {
      this.timer.remove();
      this.timer = undefined;
    }
  }
}
