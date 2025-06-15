// globalStore.js
const tamagotchiDefault = {
    hp: 100,
    coin: 100,
    level: 1,
    queue: [],
};

const battleDefault = {
    opponent: 'default',
    result: undefined,
};

class GameStore extends Phaser.Events.EventEmitter {
  constructor() {
    super();
    this._data = {
      tamagotchi_hp: 100,
      tamagotchi: tamagotchiDefault,
      battle: battleDefault
    };
  }

  get(key) {
    return this._data[key];
  }

  set(key, value) {
    if (Object.keys(this._data).includes(key)) {
      const oldValue = this._data[key];
      this._data[key] = value;
      this.emit('dataChanged', key, value, oldValue); // Emit detailed change
      this.emit(`dataChanged_${key}`, value, oldValue); // Emit specific change
    }
  }
}
export const gameStore = new GameStore(); // Singleton instance

// In a scene:
// import { gameStore } from './globalStore.js';
// gameStore.set('score', gameStore.get('score') + 100);
// gameStore.on('dataChanged_score', (newVal, oldVal) => { /* update UI */ });