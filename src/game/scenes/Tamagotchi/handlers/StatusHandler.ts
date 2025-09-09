import { store } from '@/game/store';

const STORE_KEY = 'tamagotchi.status';

export class StatusHandler {
  private statusState = store<number>(STORE_KEY);

  constructor() {}

  init() {}

  public runEffect = (effect) => {
    const { status } = effect;
    if (status?.method === 'set') {
      this.statusState?.set(status.value);
    }
  }

  destroy() {
    this.statusState?.unwatchAll();
  }
}
