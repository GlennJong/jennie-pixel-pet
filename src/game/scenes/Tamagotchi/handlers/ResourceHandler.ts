
import Phaser from 'phaser';
import { store, getStoreState, setStoreState } from '@/game/store';

type ResourceRule = {
  change: number;
  interval: number;
  min?: number;
  max?: number;
};

type StatusConfig = {
  resources: Record<string, ResourceRule>;
};

export class ResourceHandler {
  private scene: Phaser.Scene;
  private timers: Record<string, Phaser.Time.TimerEvent> = {};
  private resourceStates: Record<string, ReturnType<typeof store<number>>> = {};
  private statusState = store<string>('tamagotchi.status');
  private statusConfig: Record<string, StatusConfig> = {};
  private onFull: Record<string, () => void> = {};
  private onZero: Record<string, () => void> = {};

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(statusConfig: Record<string, StatusConfig>, resourceKeys: string[], hooks?: { onFull?: Record<string, () => void>, onZero?: Record<string, () => void> }) {
    this.statusConfig = statusConfig;
    this.onFull = hooks?.onFull || {};
    this.onZero = hooks?.onZero || {};

    // 初始化所有資源的 store 監聽
    resourceKeys.forEach((key) => {
      const s = store<number>(`tamagotchi.${key}`);
      this.resourceStates[key] = s;
      s?.watch((newValue, _oldValue) => this.handleResourceChange(key, newValue));
    });

    // 監聽 status 變化
    this.statusState?.watch(this.handleStatusChange);
    // 初始化當前 status 的自動化規則
    this.handleStatusChange(this.statusState?.get() || 'normal');
  }

  private handleStatusChange = (status: string) => {
    // 移除所有舊的 timer
    Object.values(this.timers).forEach(timer => timer.remove());
    this.timers = {};
    const config = this.statusConfig[status];
    if (!config) return;
    Object.entries(config.resources).forEach(([key, rule]) => {
      if (rule.interval > 0) {
        this.timers[key] = this.scene.time.addEvent({
          delay: rule.interval,
          loop: true,
          callback: () => {
            const isPaused = getStoreState('global.is_paused');
            if (isPaused) return;
            const current = getStoreState(`tamagotchi.${key}`) as number;
            const min = rule.min ?? 0;
            const max = rule.max ?? 100;
            const next = Math.max(min, Math.min(max, current + rule.change));
            setStoreState(`tamagotchi.${key}`, next);
          }
        });
      }
    });
  };

  private handleResourceChange = (key: string, value: number) => {
    const rule = Object.values(this.statusConfig).flatMap(cfg => Object.entries(cfg.resources)).find(([k]) => k === key)?.[1] as ResourceRule | undefined;
    if (!rule) return;
    const min = rule.min ?? 0;
    const max = rule.max ?? 100;
    if (value === max && this.onFull[key]) this.onFull[key]!();
    if (value === min && this.onZero[key]) this.onZero[key]!();
  };

  public runEffect = (effect: Record<string, { method: string, value: number }>) => {
    Object.entries(effect).forEach(([key, op]) => {
      const storeKey = `tamagotchi.${key}`;
      const current = getStoreState(storeKey) as number;
      if (op.method === 'add') {
        setStoreState(storeKey, current + op.value);
      } else if (op.method === 'sub') {
        setStoreState(storeKey, current - op.value);
      } else if (op.method === 'set') {
        setStoreState(storeKey, op.value);
      }
    });
  };

  destroy() {
    Object.values(this.resourceStates).forEach(state => state?.unwatchAll());
    Object.values(this.timers).forEach(timer => timer.remove());
    this.timers = {};
    this.onFull = {};
    this.onZero = {};
    this.statusState?.unwatchAll();
  }
}
