import { EventBus } from '../../EventBus';
import Phaser, { Scene } from 'phaser';
import { canvas } from '../../constants';
import { PrimaryDialogue } from '../../components/PrimaryDialogue';
import { Header } from './Header';
import { TamagotchiCharacter } from './TamagotchiCharacter';
import { RoomWindow } from './RoomWindow';
import { RoomRecorder } from './RoomRecorder';
import { sceneConverter, sceneStarter } from '../../components/CircleSceneTransition';
import { CustomDecroation } from './CustomDecroation';

type TInheritData = {
  hp: number;
  mp: number;
};

const WINDOW_POSITION = { x: 80, y: 32 };
const RECORDER_POSITION = { x: 26, y: 62 }

const DEFAULT_TAMAGOTCHI = {
  x: 80,
  y: 84,
  edge: { from: 50, to: 120 }
}

export default class Room extends Scene {
  character: Phaser.GameObjects.Sprite | undefined;
  camera: Phaser.Cameras.Scene2D.Camera | undefined;
  header: Header | undefined;
  keyboardInputer?: Phaser.Types.Input.Keyboard.CursorKeys;

  private tamagotchi: TamagotchiCharacter | undefined;

  constructor() {
    super('Room');
  }
  init(data: TInheritData) {
    this.handleRenderScene(this, data);
  }
  preload() {}
  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xff0000);

    sceneStarter(this);

    EventBus.emit('current-scene-ready', this);
  }

  private dialogue: PrimaryDialogue | undefined;

  private handleRenderScene(scene: Phaser.Scene, data: TInheritData) {
    // Room Background
    const background = scene.make.image({
      key: 'tamagotchi_room',
      frame: 'room',
      x: canvas.width / 2,
      y: canvas.height / 2,
    });
    scene.add.existing(background);

    // Window
    new RoomWindow(scene, WINDOW_POSITION);

    // Recorder
    new RoomRecorder(scene, RECORDER_POSITION);

    // Custom Decroation
    new CustomDecroation(scene, 'front');

    // Dialogue
    const dialogue = new PrimaryDialogue(scene);
    this.dialogue = dialogue;

    // Header Block
    this.header = new Header(scene);

    // Build Tamagotchi Charactor
    this.tamagotchi = new TamagotchiCharacter(scene, {
      ...DEFAULT_TAMAGOTCHI,
      hp: data.hp,
      callbackFunctions: {
        onHpChange: (value: number) => this.header?.setValue({ hp: value }),
      },
    });

    // apply hp
    this.header.setValue({ hp: this.tamagotchi.status.hp });
    this.keyboardInputer = scene.input.keyboard?.createCursorKeys();
  }

  private isFunctionalRunning: boolean = false;
  private functionalActionQuene: { user: string; action: string }[] = [];

  private handleFunctionalActionQuene = async () => {
    this.isFunctionalRunning = true;
    const currentActionQuene = this.functionalActionQuene[0];

    const _run = async () => {
      const { action, user } = currentActionQuene;
      const result = this.tamagotchi?.runFuntionalAction(action);

      if (result) {
        const currentDialog = result.dialog.map((_item) => {
          return {
            ..._item,
            text: _item.text.replaceAll('{{user_name}}', user),
          };
        });
        this.header && this.header.showHeader(5000);

        await this.dialogue?.runDialog(currentDialog);

        // Special move for battle
        if (action === 'battle') {
          const opponent = ['currycat', 'jennie'].includes(user) ? user : 'beibei';
          sceneConverter(this, 'Battle', { opponent });
        }

        // Finish action and remove from queue
        this.functionalActionQuene.splice(0, 1);
        
      }
      this.isFunctionalRunning = false;
    };

    _run();
  };

  controller(input: string) {
    console.log(input);
    // this.tamagotchi.manualContolAction(input);
  }

  private keyboardflipFlop = { left: false, right: false, space: false };

  private async handleHeaderAction(action: string) {
    const user = 'currycat';
    this.functionalActionQuene.push({ user, action });
  }

  update(time: number) {
    // if (this.functionalActionQuene.length !== 0 && !this.isFunctionalRunning) {
    if (this.functionalActionQuene.length !== 0 && !this.isFunctionalRunning) {
      this.handleFunctionalActionQuene();
    }

    // movement controller
    this.header?.statusHandler();
    this.tamagotchi?.characterHandler(time);

    // temp Controller
    if (this.keyboardInputer) {
      // this.header.setAlpha(1);
      if (this.keyboardInputer.left.isDown) {
        if (this.keyboardflipFlop.left) return;
        this.header?.moveToPreviousSelector();
        this.keyboardflipFlop.left = true;
      } else if (
        this.keyboardflipFlop.left &&
        this.keyboardInputer['left'].isUp
      ) {
        this.keyboardflipFlop.left = false;
      }

      if (this.keyboardInputer['right'].isDown) {
        if (this.keyboardflipFlop.right) return;
        this.header?.moveToNextSelector();
        this.keyboardflipFlop.right = true;
      } else if (
        this.keyboardflipFlop.right &&
        this.keyboardInputer['right'].isUp
      ) {
        this.keyboardflipFlop.right = false;
      }

      if (this.keyboardInputer['space'].isDown) {
        if (this.keyboardflipFlop.space) return;
        // const currentSelector = this.header.currentSelector;
        // this.header.currentSelector;
        if (this.header) {
          this.handleHeaderAction(this.header.currentSelector);
        }
        this.keyboardflipFlop.space = true;
      } else if (
        this.keyboardflipFlop.space &&
        this.keyboardInputer['space'].isUp
      ) {
        this.keyboardflipFlop.space = false;
      }
    }
  }
}
