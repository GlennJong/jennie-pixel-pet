import { Scene } from 'phaser';
import { initStore, loadAllStoresFromLocalStorage } from '@/game/store';
import { ConfigManager } from '../managers/ConfigManagers';

const DEFAULT_HP = 100;
const DEFAULT_COIN = 20;
const DEFAULT_LEVEL = 0;
const DEFAULT_GLOBAL_TRANSMIT = {};

export class MainScene extends Scene {
    constructor() {
        super('MainScene');
    }

    async create() {
        const isAutoSave = localStorage.getItem('isEnableAutoSave') === 'true';
        const isSavedStoreExisted = !!localStorage.getItem('pet_store');

        if (isAutoSave && isSavedStoreExisted) {
            await loadAllStoresFromLocalStorage();
        } else {
            initStore('global.is_paused', false);
            initStore('global.transmit', DEFAULT_GLOBAL_TRANSMIT);
            initStore('global.messageQueue', []);

            const resources = ConfigManager.getInstance().get('pet.resources');
            resources.forEach(({key, value}) => {
                initStore(`pet.${key}`, value || 0);
            })
            initStore('pet.hp', DEFAULT_HP);
            initStore('pet.coin', DEFAULT_COIN);
            initStore('pet.level', DEFAULT_LEVEL);
            initStore('pet.win', 0);
            
            initStore('pet.status', 'normal');
            initStore('pet.taskQueue', []);
            // initStore('pet.battleResult', 'win');
        }
        this.scene.start('Pet');

    }

    shutdown() {
    }
}