import { ConfigManager } from '@/game/managers/ConfigManagers';
import { store } from '@/game/store';

export interface AutoActionConfig {
  auto: boolean;
  condition: Record<string, any>;
  [key: string]: any;
}

export class AutoActionHandler {
  private _autoWatchers: { key: string, handler: (v: any) => void }[] = [];
  private cache: Record<string, any> = {};
  private triggerValueMap: Record<string, Set<any>> = {};
  private autoActions: AutoActionConfig[] = [];
  private onTrigger?: (action: any) => void;
  // 移除 pendingActions 機制
  private lastTriggeredAction: string | null = null;

  constructor() {
    const actions = ConfigManager.getInstance().get('pet.mycharacter.actions');
    this.autoActions = Object.values(actions).filter(a => a.auto && a.condition);
  }

  public init({ onTrigger }: { onTrigger?: (action: any) => void }) {
    if (onTrigger) {
      this.onTrigger = onTrigger;
    }
    // 移除舊監聽
    this.clearWatchers();
    // 建立觸發值集合
    this.triggerValueMap = {};
    for (const a of this.autoActions) {
      for (const key of Object.keys(a.condition)) {
        if (!this.triggerValueMap[key]) this.triggerValueMap[key] = new Set();
        this.triggerValueMap[key].add(a.condition[key]);
      }
    }
    // 監聽 store
    const watchedKeys = new Set(this.autoActions.flatMap(a => Object.keys(a.condition)));
    watchedKeys.forEach(key => {
      this.cache[key] = store<string>(`pet.${key}`)?.get();
      const handler = this.makeHandler(key);
      store<string>(`pet.${key}`)?.watch(handler);
      this._autoWatchers.push({ key, handler });
    });
  }

  private makeHandler = (key: string) => {
    return (v: any) => {
      this.cache[key] = v;
      const matchAction = this.autoActions.find(a => {
        return Object.keys(a.condition).every(k => {
          const cond = a.condition[k];
          const val = this.cache[k];
          if (Array.isArray(cond)) {
            return cond.includes(val);
          }
          if (typeof cond === 'object' && cond !== null && 'op' in cond && 'value' in cond) {
            switch (cond.op) {
              case '==': return val === cond.value;
              case '>=': return val >= cond.value;
              case '<=': return val <= cond.value;
              case '>': return val > cond.value;
              case '<': return val < cond.value;
              default: return false;
            }
          }
          return val === cond;
        });
      });
      if (matchAction) {
        if (this.lastTriggeredAction !== matchAction.action) {
          this.onTrigger?.(matchAction);
          this.lastTriggeredAction = matchAction.action;
        }
      }
    };
  }


  clearWatchers() {
    for (const { key, handler } of this._autoWatchers) {
      store<string>(`pet.${key}`)?.unwatch(handler);
    }
    this._autoWatchers = [];
  }

  destroy() {
    for (const { key, handler } of this._autoWatchers) {
      store<string>(`pet.${key}`)?.unwatch(handler);
    }
    this._autoWatchers = [];
  }
}
