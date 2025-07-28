import Phaser, { Scene } from 'phaser';

// common components
import { setStoreState } from '@/game/store';
import { originalHeight, originalWidth } from '@/game/constants';
import { PrimaryDialogue } from '@/game/components/PrimaryDialogue';
import { sceneStarter } from '@/game/components/CircleSceneTransition';

// partial components
import { Header } from './elements/Header';
import { Property } from './elements/Property';
import { TamagotchiCharacter } from './elements/TamagotchiCharacter';

// services
import { TaskQueueHandler } from './tasks/TaskQueueHandler';

// handlers
import { KeyboardHandler } from './handlers/KeyboardHander';
import { PropertyHandler } from './handlers/PropertyHandler';
import { HpHandler } from './handlers/HpHandler';

// controller
import Controller from './controller';

const DEFAULT_USER_NAME = 'user';

export default class TamagotchiScene extends Scene {
  private background?: Phaser.GameObjects.Image;
  private header?: Header;
  private property?: Property;
  private character?: TamagotchiCharacter;
  private dialogue?: PrimaryDialogue;
  private keyboardHandler?: KeyboardHandler;

  private taskQueueHandler?: TaskQueueHandler;
  private propertyHandler?: PropertyHandler;
  private hpHandler?: HpHandler;
  private gameController?: Controller;
  
  constructor() {
    super('Tamagotchi');
  }
  create() {
    // ============= Mechanism =============
    // charactor
    this.character = new TamagotchiCharacter(this);

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
    this.gameController = new Controller(this,
      {
        character: this.character,
        header: this.header,
        dialogue: this.dialogue,
      }
    );

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
      this.taskQueueHandler?.addTask({ user: DEFAULT_USER_NAME, action });
    }
  }

  update(time: number) {
    this.character?.update(time);
    this.header!.update();
    this.property!.update();
    this.keyboardHandler!.update();
  }

  shutdown = () => {
    this.gameController?.setReady(false);
    this.character?.destroy();
    this.background?.destroy();
    this.header?.destroy();
    this.property?.destroy();
    this.dialogue?.destroy();
    this.taskQueueHandler?.destroy();
  }
}
