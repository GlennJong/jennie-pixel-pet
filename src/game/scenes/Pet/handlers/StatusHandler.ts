import { ConfigManager } from '@/game/managers/ConfigManagers';
import { getStoreState, store } from '@/game/store';

const STORE_KEY = 'pet.status';
const CONFIG_KEY = 'pet.mycharacter.statuses'

export class StatusHandler {
  private config = ConfigManager.getInstance().get(CONFIG_KEY) || undefined;
  private statusState = store<number>(STORE_KEY);

  constructor() {}

  public getStatus(): string {
    return getStoreState('pet.status');
  }

  public getConfig(): string {
    const current = this.getStatus();
    return this.config[current] || ErrorEvent;
  }

  public runEffect = (effect) => {
    if (!effect) return;
    const { status } = effect;
    if (status?.method === 'set') {
      this.statusState?.set(status.value);
    }
  }

  destroy() {
    this.statusState?.unwatchAll();
  }
}
