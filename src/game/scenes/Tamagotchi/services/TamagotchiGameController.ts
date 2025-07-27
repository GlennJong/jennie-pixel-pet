import { setStoreState, getStoreState, store } from '@/game/store';
import { sceneConverter } from '@/game/components/CircleSceneTransition';
import { PrimaryDialogue } from '@/game/components/PrimaryDialogue';

import { Task } from '../services/TaskQueueHandler';
import { Header } from '../components/Header';
import { TamagotchiCharacter } from '../components/TamagotchiCharacter';

export class TamagotchiGameController {
  private isTamagotchiReady: boolean = false;
  private character: TamagotchiCharacter;
  private header: Header;
  private dialogue: PrimaryDialogue;
  private scene: Phaser.Scene;
  private HEADER_DISPLAY_DURATION: number;

  constructor({
    character,
    header,
    dialogue,
    scene,
    headerDisplayDuration
  }: {
    character: TamagotchiCharacter,
    header: Header,
    dialogue: PrimaryDialogue,
    scene: Phaser.Scene,
    headerDisplayDuration: number
  }) {
    this.character = character;
    this.header = header;
    this.dialogue = dialogue;
    this.scene = scene;
    this.HEADER_DISPLAY_DURATION = headerDisplayDuration;
  }

  setReady(ready: boolean) {
    this.isTamagotchiReady = ready;
  }

  async handleActionQueueTask(task: Task) {
    if (!this.isTamagotchiReady) return false;
    const { action, user, params } = task;
    let success = false;
    try {
      const result = await this.character?.runFuntionalActionAsync(action, user);
      this.header.showHeader(this.HEADER_DISPLAY_DURATION);
      if (result) {
        const { sentences, hp, coin, nextScene } = { ...result, ...params };
        await this.dialogue.runDialogue(sentences);
        if (hp) setStoreState('tamagotchi.hp', getStoreState('tamagotchi.hp') + hp);
        if (coin) setStoreState('tamagotchi.coin', getStoreState('tamagotchi.coin') + coin);
        if (nextScene) await sceneConverter(this.scene, nextScene);
      }
      success = true;
    } catch (err) {
      console.error('handleActionQueueTask error:', err);
      success = false;
    }
    return success;
  }

  handleBattleAward(taskQueueHandler: any) {
    const globalParamsStore = store('global.transmit');
    if (!globalParamsStore) return;
    const params: { battleResult?: string } = globalParamsStore.get() || {};
    if (params.battleResult === 'win') {
      taskQueueHandler?.addEmergentTask({ action: 'award', user: 'system' });
    } else if (params.battleResult === 'lose') {
      taskQueueHandler?.addEmergentTask({ action: 'lost', user: 'system' });
    }
    globalParamsStore.set('undefined');
  }

  async handleUpgrade(taskQueueHandler: any, params: any) {
    if (!this.isTamagotchiReady) return false;
    taskQueueHandler?.addTask({ action: 'buy', user: 'system', params });
    return true;
  }

  handleFullHp(taskQueueHandler: any) {
    if (!this.isTamagotchiReady) return false;
    taskQueueHandler?.addEmergentTask({ action: 'born', user: 'system' });
    return true;
  }

  handleZeroHp(taskQueueHandler: any) {
    if (!this.isTamagotchiReady) return false;
    taskQueueHandler?.addEmergentTask({ action: 'dead', user: 'system' });
    return true;
  }
}
