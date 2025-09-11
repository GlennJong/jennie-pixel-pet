import Phaser, { Scene } from 'phaser';

// common components
import { originalHeight, originalWidth } from '@/game/constants';
import { sceneConverter, sceneStarter } from '@/game/components/CircleSceneTransition';
import { setStoreState, store } from '@/game/store';
import { EventBus } from '@/game/EventBus';

// partial elements
import { Header } from './elements/Header';
import { TamagotchiCharacter } from './elements/TamagotchiCharacter';
import { TamagotchiDialogue } from './elements/TamagotchiDialogue';

// services
import { TaskQueueService } from './services/TaskQueueService';

// handlers
import { KeyboardHandler } from './handlers/KeyboardHander';
import { Task } from './services/types';
import { ConfigManager } from '@/game/managers/ConfigManagers';
import { StatusHandler } from './handlers/StatusHandler';
import { AutoActionHandler } from './handlers/AutoActionHandler';
import { ResourceHandler } from './handlers/ResourceHandler';
import { Property } from './elements/Property';


const DEFAULT_CHARACTER_KEY = 'tamagotchi_afk';
const HEADER_DISPLAY_DURATION = 5000;

export default class TamagotchiScene extends Scene {
  private config: {[key: string]: any} = {};
  
  // private background?: Phaser.GameObjects.Image;
  private header?: Header;
  private property?: Property;
  private character?: TamagotchiCharacter;
  private dialogue?: TamagotchiDialogue;
  private keyboardHandler?: KeyboardHandler;

  private taskQueueService?: TaskQueueService;
  // private coinHandler?: CoinHandler;
  private resourceHandlerGroup: ResourceHandler[] = [];
  private statusHandler?: StatusHandler;
  private autoActionHandler?: AutoActionHandler;

  private isTamagotchiReady: boolean = false;

  constructor() {
    super('Tamagotchi');
  }
  create() {
    // ============= Mechanism =============
    setStoreState('global.is_paused', true);

    // charactor
    this.character = new TamagotchiCharacter(this);
    this.config = this.cache.json.get('config').tamagotchi[DEFAULT_CHARACTER_KEY].activities || {};

    // property
    this.property = new Property(this);
    this.property.init();

    // header
    this.header = new Header(this);
    
    // dialogue
    this.dialogue = new TamagotchiDialogue(this);

    // Resources Handler
    const resources = ConfigManager.getInstance().get('tamagotchi.afk2.resources');
    
    resources.forEach(({ key, min, max, value }) => {
      // initStore(`tamagotchi.${key}`, value || 0);
      const handler = new ResourceHandler(this, `tamagotchi.${key}`, min, max);
      handler.init();
      this.resourceHandlerGroup.push(handler);
    });

    // Status handler
    this.statusHandler = new StatusHandler();
    // this.statusHandler.init();

    // queue init
    this.taskQueueService = new TaskQueueService(this);
    this.taskQueueService.init({
      onTask: (task) => this.handleActionQueueTask(task),
      interval: 300
    });

    this.autoActionHandler = new AutoActionHandler();
    this.autoActionHandler.init({
      onTrigger: (action) => this.handleAddEmergencyTask(action)
    });

    // Build Keyboard 
    this.keyboardHandler = new KeyboardHandler(this, {
      onLeft: () => this.handleControlButton('left'),
      onRight: () => this.handleControlButton('right'),
      onSpace: () => this.handleControlButton('space')
    });

    EventBus.on('game-left-keydown', () => {this.handleControlButton('left')}),
    EventBus.on('game-right-keydown', () => this.handleControlButton('right')),
    EventBus.on('game-select-keydown', () => this.handleControlButton('space')),

    
    // Run opening scene and start tamagotchi
    (async() => {
      await sceneStarter(this);
      // this.handleBattleAward(this.taskQueueService);
      this.character?.startTamagotchi();
      this.isTamagotchiReady = true;
      setStoreState('global.is_paused', false);
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

      // action: drink | battle | write | sleep | awake
      // const currentAction = this.config[action];
      
      const task = ConfigManager.getInstance().get(`tamagotchi.afk2.actions.${action}`);
      this.taskQueueService?.addTask(task);
    }
  }

  async handleActionQueueTask(task: Task) {
    
    if (!this.isTamagotchiReady) return false;
    let success = false;

    const { action, user, params, effect, dialogs, move } = task;
    // console.log({params})
    try {



      // console.log({animation})
      // 1.角色執行行為
      // 2.執行對話
      // 3.執行上放狀態列
      // 4.執行裝飾管理
      // 5.執行場景轉換
      
      // Run Character Animation
      // await this.character?.runAnimation();
      
      await this.character?.runFuntionalActionAsync(action);
      this.statusHandler?.runEffect(effect);

      // Run Dialogue
      if (this.dialogue) {
        let effectReplacement = {};
        
        if (effect) {
          effectReplacement = Object.fromEntries(
            Object.entries(effect).map(([key, obj]) => [key, (obj as { value: any }).value])
          );
        }
        const replacement = {user, ...effectReplacement, ...params};
        await this.dialogue.runDialogue2(dialogs, replacement);
      }

      this.resourceHandlerGroup.forEach((handler) => handler.runEffect(effect));
      
      // this.header?.showHeader(HEADER_DISPLAY_DURATION);

      // if (move) {
      //   sceneConverter(this, move.scene, move.data);
      // }

      success = true;
    } catch (err) {
      console.error('handleActionQueueTask error:', err);
      success = false;
    }
    return success;
  }

  handleAddEmergencyTask(task: Task) {
    this.taskQueueService?.addTask(task);
  }

  async handleUpgrade(taskQueueService: any, params: any) {
    if (!this.isTamagotchiReady) return false;
    taskQueueService?.addTask({ action: 'buy', user: 'system', params });
    return true;
  }

  update() {
    this.character?.update();
    this.header!.update();
    this.keyboardHandler!.update();
  }

  shutdown = () => {
    this.isTamagotchiReady = false;
    this.character?.destroy();
    this.header?.destroy();
    this.property?.destroy();
    this.dialogue?.destroy();
    this.autoActionHandler?.destroy();
    this.taskQueueService?.destroy();

    this.resourceHandlerGroup.forEach((handler) => handler.destroy());

    EventBus.off('game-left-keydown');
    EventBus.off('game-right-keydown');
    EventBus.off('game-select-keydown');
  }
}
