
import Phaser from 'phaser';
import { store, getStoreState, setStoreState } from '@/game/store';
import { ConfigManager } from '@/game/managers/ConfigManagers';


export class ResourceHandler {
  private timer?: Phaser.Time.TimerEvent;
  private scene: Phaser.Scene;
  private statusState = store<string>('tamagotchi.status');
  private resourceState: ReturnType<typeof store<number>>;
  private storeKey: string;
  private min: number;
  private max: number;

  constructor(scene: Phaser.Scene, storeKey: string, min = -Infinity, max = Infinity) {
    this.scene = scene;
    this.storeKey = storeKey;
    this.resourceState = store<number>(storeKey);
    this.min = min;
    this.max = max;
  }

  init() {
    this.statusState?.watch(this.handleSetRule);
    this.handleSetRule(this.statusState?.get());
  }

  private handleSetRule = (_value: unknown): void => {
    if (this.timer) {
      this.timer.remove();
      this.timer = undefined;
    }
    const statuses = ConfigManager.getInstance().get('tamagotchi.afk2.statuses') as Record<string, any>;
    const status = this.statusState?.get();
    
    if (!status || !statuses || typeof statuses !== 'object') return;
    const statusObj = statuses[status];
    if (!statusObj || typeof statusObj !== 'object') return;
    const rules = statusObj.rules as Record<string, any>;
    if (!rules || !rules[this.getResourceKey()]) return;
    const rule = rules[this.getResourceKey()];

    this.timer = this.scene.time.addEvent({
      delay: rule.interval,
      loop: true,
      callback: () => {
        const isStopped = getStoreState('global.is_paused');
        if (isStopped) return;
        const currentValue = getStoreState(this.storeKey) as number;
        const { method, value } = rule;
        let newValue = 0;
        if (method === 'sub') {
          newValue = value * -1;
        } else if (method === 'add') {
          newValue = value;
        }
        const result = Math.max(this.min, Math.min(this.max, currentValue + newValue));
        setStoreState(this.storeKey, result);
      }
    });
  }

  // 取得資源 key (如 'hp', 'mp')
  private getResourceKey(): string {
    const parts = this.storeKey.split('.');
    return parts[parts.length - 1];
  }

  public runEffect = (effect: Record<string, any>): void => {
    if (!effect) return;
    
    const key = this.getResourceKey();
    const resourceEffect = effect[key];
    if (!resourceEffect) return;
    const current = getStoreState(this.storeKey) as number;
    if (resourceEffect.method === 'add') {
      setStoreState(this.storeKey, Math.min(this.max, current + resourceEffect.value));
    } else if (resourceEffect.method === 'sub') {
      setStoreState(this.storeKey, Math.max(this.min, current - resourceEffect.value));
    } else if (resourceEffect.method === 'set') {
      setStoreState(this.storeKey, Math.max(this.min, Math.min(this.max, resourceEffect.value)));
    }
  }

  destroy() {
    this.resourceState?.unwatchAll();
    if (this.timer) {
      this.timer.remove();
      this.timer = undefined;
    }
  }
}
