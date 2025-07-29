import { Scene } from 'phaser';
import { initStore, loadAllStoresFromLocalStorage } from '@/game/store';

const DEFAULT_HP = 100;
const DEFAULT_COIN = 20;
const DEFAULT_LEVEL = 1;
// const DEFAULT_GLOBAL_TRANSMIT = {};
const DEFAULT_GLOBAL_TRANSMIT = { battleResult: 'win' };

export class MainScene extends Scene {
    constructor() {
        super('MainScene');
    }

    async create() {
        const isAutoSave = localStorage.getItem('isEnableAutoSave') === 'true';
        const isSavedStoreExisted = !!localStorage.getItem('tamagotchi_store');

        if (isAutoSave && isSavedStoreExisted) {
            await loadAllStoresFromLocalStorage();
        } else {
            initStore('global.isPaused', false);
            initStore('global.transmit', DEFAULT_GLOBAL_TRANSMIT);
            initStore('global.messageQueue', []);
            initStore('tamagotchi.hp', DEFAULT_HP);
            initStore('tamagotchi.isAlive', true);
            initStore('tamagotchi.isSleep', false);
            initStore('tamagotchi.taskQueue', []);
            initStore('tamagotchi.coin', DEFAULT_COIN);
            initStore('tamagotchi.level', DEFAULT_LEVEL);
            initStore('tamagotchi.battleResult', 'win');
        }
        this.scene.start('Tamagotchi');
    }

    shutdown() {
    }
}