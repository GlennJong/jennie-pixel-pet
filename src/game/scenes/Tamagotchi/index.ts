import Phaser, { Scene } from 'phaser';

// common components
import { originalHeight, originalWidth } from '@/game/constants';
import { sceneConverter, sceneStarter } from '@/game/components/CircleSceneTransition';
import { setStoreState, store } from '@/game/store';
import { EventBus } from '@/game/EventBus';

// partial elements
import { Header } from './elements/Header';
import { Property } from './elements/Property';
import { TamagotchiCharacter } from './elements/TamagotchiCharacter';
import { TamagotchiDialogue } from './elements/TamagotchiDialogue';

// services
import { TaskQueueHandler } from './services/TaskQueueService';

// handlers
import { KeyboardHandler } from './handlers/KeyboardHander';
import { PropertyHandler } from './handlers/PropertyHandler';
import { HpHandler } from './handlers/HpHandler';
import { Task } from './services/types';


const DEFAULT_USER_NAME = 'user';
const DEFAULT_CHARACTER_KEY = 'tamagotchi_afk';
const HEADER_DISPLAY_DURATION = 5000;

export default class TamagotchiScene extends Scene {
  private config: {[key: string]: any} = {};
  private background?: Phaser.GameObjects.Image;
  private header?: Header;
  private property?: Property;
  private character?: TamagotchiCharacter;
  private dialogue?: TamagotchiDialogue;
  private keyboardHandler?: KeyboardHandler;

  private taskQueueHandler?: TaskQueueHandler;
  private propertyHandler?: PropertyHandler;
  private hpHandler?: HpHandler;

  private isTamagotchiReady: boolean = false;
  
  constructor() {
    super('Tamagotchi');
  }
  create() {
    // ============= Mechanism =============
    setStoreState('global.isPaused', true);
    
    // charactor
    this.character = new TamagotchiCharacter(this);
    this.config = this.cache.json.get('config').tamagotchi[DEFAULT_CHARACTER_KEY].activities || {};

    // background
    this.background = this.make.image({
      key: 'tamagotchi_room',
      frame: 'room',
      x: 0,
      y: 0,
    })
    .setDisplayOrigin(originalWidth, originalHeight)
    .setOrigin(0);
    this.add.existing(this.background);

    // property
    this.property = new Property(this);
    this.add.existing(this.property);

    // header
    this.header = new Header(this);
    this.add.existing(this.header);

    // dialogue
    this.dialogue = new TamagotchiDialogue(this);

    // queue
    this.taskQueueHandler = new TaskQueueHandler(this);

    // property
    this.propertyHandler = new PropertyHandler(this);

    // hp
    this.hpHandler = new HpHandler(this);
    this.hpHandler.init({
      onFullHp: () => this.handleFullHp(this.taskQueueHandler),
      onZeroHp: () => this.handleZeroHp(this.taskQueueHandler)
    });

    // queue init
    this.taskQueueHandler.init({
      onTask: (task) => this.handleActionQueueTask(task),
      interval: 300
    });

    // property
    this.propertyHandler.init({
      onUpgrade: (params) => this.handleUpgrade(this.taskQueueHandler, params)
    });

    // Build Keyboard 
    this.keyboardHandler = new KeyboardHandler(this, {
      onLeft: () => this.handleControlButton('left'),
      onRight: () => this.handleControlButton('right'),
      onSpace: () => this.handleControlButton('space')
    });
    EventBus.on('game-left-keydown', () => this.handleControlButton('left'));
    EventBus.on('game-right-keydown', () => this.handleControlButton('right'));
    EventBus.on('game-select-keydown', () => this.handleControlButton('select'));

    // Run opening scene and start tamagotchi
    (async() => {
      await sceneStarter(this);
      this.handleBattleAward(this.taskQueueHandler);
      this.character?.startTamagotchi();
      this.isTamagotchiReady = true;
      setStoreState('global.isPaused', false);
    })();

    this.events.on('shutdown', this.shutdown, this);
  }

  private handleControlButton = (key: string) => {
    if (key === 'left' ) {
      this.header!.movePrev()
    } else if (key === 'right') {
      this.header!.moveNext()
    } else if (key === 'space') {
      const action = this.header!.select();
      this.taskQueueHandler?.addTask({ user: DEFAULT_USER_NAME, action });
    }
  }

  async handleActionQueueTask(task: Task) {
    if (!this.isTamagotchiReady) return false;
    let success = false;

    const { nextScene } = this.config[task.action];
    const { action, user, params } = task;
    try {
      // Run Character Animation
      await this.character?.runFuntionalActionAsync(action);

      // Run Dialogue
      if (this.dialogue) {
        await this.dialogue.runDialogue(action, user);
      }
      
      // Change header elements
      if (this.header) {
        this.header.showHeader(HEADER_DISPLAY_DURATION);
        this.header.runAction(action);
      }

      if (this.property) {
        this.property.runAction(action);
      }
      
      // Change scene if need
      if (params) setStoreState('global.transmit', params);
      if (nextScene) await sceneConverter(this, nextScene);
      
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
    console.log('work')
    if (!this.isTamagotchiReady) return false;
    taskQueueHandler?.addEmergentTask({ action: 'born', user: 'system' });
    return true;
  }

  handleZeroHp(taskQueueHandler: any) {
    if (!this.isTamagotchiReady) return false;
    taskQueueHandler?.addEmergentTask({ action: 'dead', user: 'system' });
    return true;
  }

  update() {
    this.character?.update();
    this.header!.update();
    this.property!.update();
    this.keyboardHandler!.update();
  }

  shutdown = () => {
    this.isTamagotchiReady = false;
    this.character?.destroy();
    this.background?.destroy();
    this.header?.destroy();
    this.property?.destroy();
    this.dialogue?.destroy();
    this.taskQueueHandler?.destroy();
  }
}
