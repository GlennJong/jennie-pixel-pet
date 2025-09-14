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
        const isSavedStoreExisted = !!localStorage.getItem('tamagotchi_store');

        if (isAutoSave && isSavedStoreExisted) {
            await loadAllStoresFromLocalStorage();
        } else {
            initStore('global.is_paused', false);
            initStore('global.transmit', DEFAULT_GLOBAL_TRANSMIT);
            initStore('global.messageQueue', []);


            const resources = ConfigManager.getInstance().get('tamagotchi.resources');
            // console.log({ resources })
            resources.forEach(({key, value}) => {
                initStore(`tamagotchi.${key}`, value || 0);
            })
            initStore('tamagotchi.hp', DEFAULT_HP);
            initStore('tamagotchi.coin', DEFAULT_COIN);
            initStore('tamagotchi.level', DEFAULT_LEVEL);
            initStore('tamagotchi.win', 0);
            
            initStore('tamagotchi.status', 'normal');
            initStore('tamagotchi.taskQueue', []);
            // initStore('tamagotchi.battleResult', 'win');
        }
        this.scene.start('Tamagotchi');

    }

    shutdown() {
    }
}