import Phaser from 'phaser';
import { store, getStoreState, setStoreState } from '@/game/store';
import { ConfigManager } from '@/game/managers/ConfigManagers';

const STORE_KEY = 'tamagotchi.hp';

const DEFAULT_CONSUMED_HP = 1;
const DEFAULT_RECOVER_HP = 33;
const DEFAULT_HP_DECREASE_INTERVAL = 1000;

const RETRY_MAX_TRY = 3;
const RETRY_DELAY = 1000;

export class HpHandler {
  private timer?: Phaser.Time.TimerEvent;
  private scene: Phaser.Scene;
  private statusState = store<string>('tamagotchi.status');
  private hpState = store<number>(STORE_KEY);
  private interval: number = DEFAULT_HP_DECREASE_INTERVAL;
  private onFullHp?: () => void;
  private onZeroHp?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(params: { onFullHp?: () => void, onZeroHp?: () => void }) {
    const { onFullHp, onZeroHp } = params || {};

    this.statusState?.watch(this.handleSetRule);

    if (onFullHp) this.onFullHp = onFullHp;
    if (onZeroHp) this.onZeroHp = onZeroHp;

    this.handleSetRule(this.statusState?.get());
  }
  

  private handleSetRule = (value) => {
    if (this.timer) {
      this.timer.remove();
      this.timer = undefined;
    }
    const statuses = ConfigManager.getInstance().get('tamagotchi.afk2.statuses');
    // const { interval } = this.scene.cache.json.get('config').tamagotchi.tamagotchi_afk.base;

    // this.interval = typeof interval === 'number' ? interval : DEFAULT_HP_DECREASE_INTERVAL;
    this.hpState?.watch(this.handleHpChange);

    const status = this.statusState?.get();
    const { rules } = statuses[status] || {};

    this.timer = this.scene.time.addEvent({
      delay: rules.hp.interval,
      loop: true,
      callback: () => {
        const isStopped = getStoreState('global.is_paused') || getStoreState('tamagotchi.is_sleep');
        if (isStopped) return;
        const currentHp = getStoreState('tamagotchi.hp') as number;

        const { method, value } = rules.hp;

        let newHp = 0;
        
        if (method === 'sub') {
          newHp = value * -1
        }
        if (method === 'add') {
          newHp = value;
        }

        const resultHp = Math.max(0, Math.min(100, currentHp + newHp));
        
        setStoreState('tamagotchi.hp', resultHp);
      }
    });
    this.handleHpChange(this.hpState?.get() || 0);
  }

  private handleHpChange = async (currentHp: number) => {
    // 新增 retry 機制
    const retry = async (fn: (() => boolean) | undefined): Promise<boolean> => {
      for (let i = 0; i < RETRY_MAX_TRY; i++) {
        if (!fn) return true;
        const result = fn();
        if (result) return true;
        if (i < RETRY_MAX_TRY - 1) await new Promise(res => setTimeout(res, RETRY_DELAY));
      }
      return false;
    };
    if (currentHp === 100) {
      if (this.onFullHp) {
        this.onFullHp();
        // await retry(() => {
        //   const result = this.onFullHp?.();
        //   return typeof result === 'boolean' ? result : true;
        // });
      }
    } else if (currentHp === 0) {
      if (this.onZeroHp) {
        this.onZeroHp();
        // await retry(() => {
        //   const result = this.onZeroHp?.();
        //   return typeof result === 'boolean' ? result : true;
        // });
      }
    }
  }

  public runEffect = (effect) => {
    const { hp } = effect;
    if (!hp) return;
    if (hp.method === 'add') {
      setStoreState('tamagotchi.hp', Math.min(100, getStoreState('tamagotchi.hp') + hp.value));
    }
    else if (hp.method === 'sub') {
      setStoreState('tamagotchi.hp', Math.max(0, getStoreState('tamagotchi.hp') - hp.value));
    }
    else if (hp.method === 'set') {
      setStoreState('tamagotchi.hp', hp.value);
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
