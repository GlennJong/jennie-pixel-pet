import Phaser, { Scene } from 'phaser';
import { EventBus, setGlobalData } from '@/game/EventBus';

// common components
import { setStoreState, store, getStoreState } from '@/game/store';
import { originalHeight, originalWidth } from '@/game/constants';
import { PrimaryDialogue } from '@/game/components/PrimaryDialogue';
import { sceneConverter, sceneStarter } from '@/game/components/CircleSceneTransition';

// partial components
import { Header } from './components/Header';
import { Property } from './components/Property';
import { TamagotchiCharacter } from './components/TamagotchiCharacter';

// services
import KeyboardHandler from './services/KeyboardHander';
import { TaskQueueHandler } from './services/TaskQueueHandler';
import { TamagotchiGameController } from './services/TamagotchiGameController';
import { PropertyHandler } from './services/PropertyHandler';
import { HpHandler } from './services/HpHandler';


const DEFAULT_TAMAGOTCHI_POSITION = {
  x: 60,
  y: 68,
  edge: { from: 50, to: 120 }
}

const DEFAULT_USER = 'user';
const HEADER_DISPLAY_DURATION = 10000;

export default class TamagotchiScene extends Scene {
  private background?: Phaser.GameObjects.Image;
  private header?: Header;
  private property?: Property;
  private character?: TamagotchiCharacter;
  private dialogue?: PrimaryDialogue;
  private keyboardHandler?: KeyboardHandler;

  private isTamagotchiReady: boolean = false;
  private taskQueueHandler?: TaskQueueHandler;
  private propertyHandler?: PropertyHandler;
  private hpHandler?: HpHandler;
  private gameController?: TamagotchiGameController;
  
  constructor() {
    super('Tamagotchi');
  }
  create() {
    // ============= Mechanism =============
    // charactor
    this.character = new TamagotchiCharacter(this, DEFAULT_TAMAGOTCHI_POSITION);

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
    this.dialogue = new PrimaryDialogue(this);
    this.dialogue.initDialogue({
      onDialogueStart: () => setStoreState('global.isPaused', true),
      onDialogueEnd: () => setStoreState('global.isPaused', false),
    });

    // queue
    this.taskQueueHandler = new TaskQueueHandler(this);

    // property
    this.propertyHandler = new PropertyHandler(this);

    // hp
    this.hpHandler = new HpHandler(this);

    // game controller
    this.gameController = new TamagotchiGameController({
      character: this.character,
      header: this.header,
      dialogue: this.dialogue,
      scene: this,
      headerDisplayDuration: HEADER_DISPLAY_DURATION
    });

    // queue init
    this.taskQueueHandler.init({
      onTask: (task) => this.gameController!.handleActionQueueTask(task),
      interval: 300
    });

    // property
    this.propertyHandler.init({
      onUpgrade: (params) => this.gameController!.handleUpgrade(this.taskQueueHandler, params)
    });

    // hp
    this.hpHandler.init({
      onFullHp: () => this.gameController!.handleFullHp(this.taskQueueHandler),
      onZeroHp: () => this.gameController!.handleZeroHp(this.taskQueueHandler)
    });

    // outside controller
    EventBus.on('trigger-button', this.handleControlButton);

    // Build Keyboard 
    this.keyboardHandler = new KeyboardHandler(this, {
      onLeft: () => this.handleControlButton('left'),
      onRight: () => this.handleControlButton('right'),
      onSpace: () => this.handleControlButton('space')
    });

    // Run opening scene and start tamagotchi
    (async() => {
      await sceneStarter(this);
      this.gameController!.handleBattleAward(this.taskQueueHandler);
      this.character?.startTamagotchi();
      this.isTamagotchiReady = true;
      this.gameController!.setReady(true);
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
      this.taskQueueHandler?.addTask({ user: DEFAULT_USER, action });
    }
  }

  private handleSwitchToBattleScene = async(opponent?: string) => {
    setGlobalData('battle_opponent', opponent);
    await sceneConverter(this, 'Battle');
  }

  update(time: number) {
    this.character?.update(time);
    this.header!.update();
    this.property!.update();
    this.keyboardHandler!.update();
  }

  shutdown = () => {
    this.isTamagotchiReady = false;
    this.gameController?.setReady(false);
    this.character?.destroy();
    this.background?.destroy();
    this.header?.destroy();
    this.property?.destroy();
    this.dialogue?.destroy();
    this.taskQueueHandler?.destroy();
    EventBus.off('trigger-button', this.handleControlButton);
  }
}
