import { Scene } from 'phaser';
import { setupGlobalEventListener } from '../EventBus';

export class MainScene extends Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        // Use the reusable function to set up the global event listener
        setupGlobalEventListener(this);
        this.scene.start('Tamagotchi');
    }

    shutdown() {
    }
}