import Phaser from 'phaser';
import { store, getStoreState, setStoreState } from '@/game/store';
import { ConfigManager } from '@/game/managers/ConfigManagers';

const STORE_KEY = 'tamagotchi.hp';

export class HpHandler {
  private timer?: Phaser.Time.TimerEvent;
  private scene: Phaser.Scene;
  private statusState = store<string>('tamagotchi.status');
  private hpState = store<number>(STORE_KEY);

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init() {
    this.statusState?.watch(this.handleSetRule);
    this.handleSetRule(this.statusState?.get());
  }

  private handleSetRule = (value) => {
    if (this.timer) {
      this.timer.remove();
      this.timer = undefined;
    }
    const statuses = ConfigManager.getInstance().get('tamagotchi.afk2.statuses');

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
  }
}
