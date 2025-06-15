import Phaser, { Scene } from 'phaser';
import { EventBus, getGlobalData, setGlobalData } from '../../EventBus';
import { PrimaryDialogue } from '../../components/PrimaryDialogue';
import { Header } from './Header';
import { TamagotchiCharacter } from './TamagotchiCharacter';
import { sceneConverter, sceneStarter } from '../../components/CircleSceneTransition';
import KeyboardHandler from './KeyboardHander';

const DEFAULT_TAMAGOTCHI_POSITION = {
  x: 80,
  y: 84,
  edge: { from: 50, to: 120 }
}

const DEFAULT_USER = 'user';

export default class Tamagotchi extends Scene {
  private background: Phaser.GameObjects.Image;
  private header: Header;
  private character: TamagotchiCharacter;
  private dialogue: PrimaryDialogue;
  private keyboardHandler: KeyboardHandler;

  private actionQueue: { user: string; action: string }[] = [];
  private isActionRunning: boolean = false;
  
  constructor() {
    super('Tamagotchi');
  }
  create() {
    // Build Background
    this.background = this.make.image({
      key: 'tamagotchi_room',
      frame: 'room',
      x: 160 / 2,
      y: 144 / 2,
    });
    this.add.existing(this.background);
    
    // Inherit queue or create new queue
    this.actionQueue = getGlobalData('tamagotchi_queue') || [];

    // Convert queue from message queue
    const mapping = this.cache.json.get('config').tamagotchi_action_mapping;
    EventBus.on('message_queue-updated', (queue) => this.handleConvertActionQueue(queue, mapping));
    
    // Build Dialogue
    this.dialogue = new PrimaryDialogue(this);
    this.add.existing(this.dialogue);

    // Build Tamagotchi Charactor
    this.character = new TamagotchiCharacter(this, DEFAULT_TAMAGOTCHI_POSITION);

    // Build Header
    this.header = new Header(this);
    this.add.existing(this.header);

    // Build Keyboard
    this.keyboardHandler = new KeyboardHandler(this, {
      onLeft: () => this.header.movePrev(),
      onRight: () => this.header.moveNext(),
      onSpace: () => {
        const action = this.header.select();
        this.actionQueue.push({ user: DEFAULT_USER, action });
      },
    });
    
    // Run opening scene and start tamagotchi
    (async() => {
      await sceneStarter(this);
      this.character.startTamagotchi();
    })();

    this.handleBattleAward();

  }

  private handleBattleAward = () => {
    const battleResult = getGlobalData('battle_result');
    if (battleResult === 'win') {
      // this.character.runFuntionalAction('win');
      setGlobalData('tamagotchi_coin', getGlobalData('tamagotchi_coin') + 100);
    }
    else if (battleResult === 'lose') {
      // this.character.runFuntionalAction('lost');
      setGlobalData('tamagotchi_coin', getGlobalData('tamagotchi_coin') - 10);
    }
    setGlobalData('battle_result', null);
  }

  private handleConvertActionQueue = (queue, mapping) => {
    if (queue.length === 0) return;
    for(let i = 0; i < queue.length; i++) {
      const { user, content } = queue[i];
      const result = mapping.find(_item => _item.matches.includes(content));
      if (result) {
        const action = result.action;
        const params = result.params;
        this.actionQueue.push({ user, action, params });
      }
    }
    setGlobalData('message_queue', []);
  }


  private handleActionQueue = async () => {
    this.isActionRunning = true;
    console.log(this.actionQueue);
    const { user, action, params } = this.actionQueue[0];

    const _run = async () => {
      const result = this.character.runFuntionalAction(action);

      if (result) {
        const currentDialog = result.dialog.map((_item) => ({
          ..._item,
          text: _item.text.replaceAll('{{user_name}}', user),
        }));
        await this.dialogue.runDialog(currentDialog);

        if (action === 'battle') {
          await this.handleSwitchToBattleScene(user, params);
        }
      }
      
      this.actionQueue.splice(0, 1);
      this.isActionRunning = false;
    };

    _run();
  };

  private handleSwitchToBattleScene = async(user, params) => {
    setGlobalData('battle_opponent', params?.opponent);
    await sceneConverter(this, 'Battle');
  }

  update(time: number) {

    // compoents
    this.character.update(time);
    this.header.update();
    this.keyboardHandler.update();

    // functions
    if (this.actionQueue.length !== 0 && !this.isActionRunning) {
      this.handleActionQueue();
    }
  }

  shutdown() {
    this.character.destroy()
    this.background.destroy();
    this.header.destroy();
    this.keyboardHandler.destroy();

    // store
    setGlobalData('tamagotchi_queue', this.actionQueue);
  }
}
