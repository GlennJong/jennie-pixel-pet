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
import { TaskQueueService } from './services/TaskQueueService';

// handlers
import { KeyboardHandler } from './handlers/KeyboardHander';
import { PropertyHandler } from './handlers/PropertyHandler';
import { HpHandler } from './handlers/HpHandler';
import { Task } from './services/types';
import { ConfigManager } from '@/game/managers/ConfigManagers';
import { StatusHandler } from './handlers/StatusHandler';
import { CoinHandler } from './handlers/CoinHandler';
import { AutoActionHandler } from './handlers/AutoActionHandler';


const DEFAULT_USER_NAME = 'user';
const DEFAULT_CHARACTER_KEY = 'tamagotchi_afk';
const HEADER_DISPLAY_DURATION = 5000;

export default class TamagotchiScene extends Scene {
  private config: {[key: string]: any} = {};
  private _autoWatchers: { key: string, handler: (v: any) => void }[] = [];
  
  private background?: Phaser.GameObjects.Image;
  private header?: Header;
  private property?: Property;
  private character?: TamagotchiCharacter;
  private dialogue?: TamagotchiDialogue;
  private keyboardHandler?: KeyboardHandler;

  private taskQueueService?: TaskQueueService;
  private propertyHandler?: PropertyHandler;
  private coinHandler?: CoinHandler;
  private hpHandler?: HpHandler;
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
    // const temp = this.cache.json.get('config').tamagotchi['character:game'];
    // console.log(temp);

    // const drinkAction = ConfigManager.getInstance().get('tamagotchi_new');
    // console.log({drinkAction})
    
    
    
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

    // header
    this.header = new Header(this);
    
    // dialogue
    this.dialogue = new TamagotchiDialogue(this);

    // property
    this.propertyHandler = new PropertyHandler(this);
    this.propertyHandler.init({
      onUpgrade: (params) => this.handleUpgrade(this.taskQueueService, params)
    });

    this.coinHandler = new CoinHandler(this);
    this.coinHandler.init();

    // hp
    this.hpHandler = new HpHandler(this);
    this.hpHandler.init({
      onFullHp: () => this.handleFullHp(this.taskQueueService),
      onZeroHp: () => this.handleZeroHp(this.taskQueueService)
    });

    this.statusHandler = new StatusHandler(this);
    this.statusHandler.init();

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
      this.handleBattleAward(this.taskQueueService);
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
      
      if (action === 'drink') {
        const task = ConfigManager.getInstance().get('tamagotchi.afk2.actions.drink');
        // const actionConfig = ConfigManager.getInstance().get('config');
        // console.log({drinkConfig})

        
        this.taskQueueService?.addTask(task);
        // this.taskQueueService?.addTask(this.config.drink);
      }
      else if (action === 'battle') {
        const task = ConfigManager.getInstance().get('tamagotchi.afk2.actions.sleep');

        this.taskQueueService?.addTask(task);
      }
      else if (action === 'write') {
        const task = ConfigManager.getInstance().get('tamagotchi.afk2.actions.dead');

        this.taskQueueService?.addTask(task);
      }
      // ....
      
      // this.taskQueueService?.addTask({ user: DEFAULT_USER_NAME, action });
    }
  }

  async handleActionQueueTask(task: Task) {
    
    console.log({task})
    
    if (!this.isTamagotchiReady) return false;
    let success = false;

    
    // const { nextScene } = this.config[task.action];
    // const actionConfig = this.config[task.action];
    const { action, animation, animation_infinity, user, params, effect, dialogs } = task;
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
        // await this.dialogue.runDialogue(action, {...params, user});
        const effectReplacement = Object.fromEntries(
          Object.entries(effect).map(([key, obj]) => [key, (obj as { value: any }).value])
        );
        const replacement = {user, ...effectReplacement, ...params};
        await this.dialogue.runDialogue2(dialogs, replacement);
      }
      
      this.hpHandler?.runEffect(effect);
      this.coinHandler?.runEffect(effect);
        
      this.header?.showHeader(HEADER_DISPLAY_DURATION);

      if (this.property) {
        // this.property.runAction(action);
      }
      
      // Change scene if need
      // if (params) setStoreState('global.transmit', params);
      // if (actionConfig.nextScene) await sceneConverter(this, actionConfig.nextScene);
      
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

  handleBattleAward(taskQueueService: any) {
    const globalParamsStore = store('global.transmit');
    if (!globalParamsStore) return;
    
    const params: { battleResult?: string } = globalParamsStore.get() || {};
    if (params.battleResult === 'win') {
      taskQueueService?.addEmergentTask({ action: 'award', user: 'system' });
    } else if (params.battleResult === 'lose') {
      taskQueueService?.addEmergentTask({ action: 'lose', user: 'system' });
    }
    globalParamsStore.set('undefined');
  }

  async handleUpgrade(taskQueueService: any, params: any) {
    if (!this.isTamagotchiReady) return false;
    taskQueueService?.addTask({ action: 'buy', user: 'system', params });
    return true;
  }

  handleFullHp(taskQueueService: any) {
    if (!this.isTamagotchiReady) return;

    const actions = ConfigManager.getInstance().get('tamagotchi.afk2.actions');
    const { condition } = actions.born;
    console.log(condition);
    
    // const condition = { hp: 100, status: 'dead' };
    // const task = Object.values(actions)
    //   .filter((a: any) => a.auto && a.condition)
    //   .find((a: any) => a.condition.hp === condition.hp && a.condition.status === condition.status);
    //   console.log({task})
    // if (task) {
    //   taskQueueService?.addEmergentTask(task);
    // }
    // return true;
  }

  handleZeroHp(taskQueueService: any) {
    if (!this.isTamagotchiReady) return false;
    const task = ConfigManager.getInstance().get('tamagotchi.afk2.actions.dead');
    taskQueueService?.addEmergentTask(task);

    // taskQueueService?.addEmergentTask({ action: 'dead', user: 'system' });
    // return true;
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
    this.hpHandler?.destroy();
    this.propertyHandler?.destroy();
    this.autoActionHandler?.destroy();
    this.taskQueueService?.destroy();

    // 移除 handleAuto 註冊的監聽
    if (this._autoWatchers && this._autoWatchers.length > 0) {
      for (const { key, handler } of this._autoWatchers) {
        store<string>(`tamagotchi.${key}`)?.unwatch(handler);
      }
      this._autoWatchers = [];
    }

    EventBus.off('game-left-keydown');
    EventBus.off('game-right-keydown');
    EventBus.off('game-select-keydown');
  }
}
