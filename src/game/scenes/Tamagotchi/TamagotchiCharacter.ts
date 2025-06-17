import Phaser from 'phaser';
import { Character } from '../../components/Character';
import { selectFromPiority } from '../../utils/selectFromPiority';
import { TDialogData } from '../../components/PrimaryDialogue';
import { getGlobalData, setGlobalData } from '../../EventBus';

type TDirection = 'none' | 'left' | 'right';

type TFunctionalActionDialogItem = {
  dialog: TDialogData[];
  piority: number;
};

type TAction = {
  animation: string;
  is_move?: boolean;
  has_direction?: boolean;
};

type TIdleAction = {
  piority: number;
} & TAction;

type TFunctionAction = {
  point: number;
  dialogs?: TFunctionalActionDialogItem[];
} & TAction;

// type TSpecialAction = string;
type TamagotchiCharacterProps = {
  x: number;
  y: number;
  edge: { from: number; to: number };
};

const defaultIdlePrefix = 'idle'; // TODO: idle right
const defaultHp = 50;
const defaultRecoverHpByTime = 2;
const defaultDecreaseHpByTime = -1;
const defaultXSec = 3;
const defaultEdge = { from: 50, to: 120 };

// TODO: low hp status...
const defaultMoveDistance = 32;

export class TamagotchiCharacter extends Character {
  private isAlive: boolean = true;
  private isSleep: boolean = false;
  private isBorn: boolean = false;
  private isActing: boolean = false;

  private idleActions: { [key: string]: TIdleAction };
  private unavailableActions: { [key: string]: TAction };
  public functionalAction: { [key: string]: TFunctionAction };

  private spaceEdge: { from: number; to: number };
  private direction: TDirection = 'left';

  public hp: number;

  private isReady: boolean = false;

  constructor(scene: Phaser.Scene, props: TamagotchiCharacterProps) {
    const key = 'tamagotchi_afk'; // static character here
    const hp = getGlobalData('tamagotchi_hp');

    const config = scene.cache.json.get('config')[key]; // get current character config

    const characterProps = {
      ...props,
      animations: config.animations,
    };
    
    super(scene, key, characterProps);

    const shadow = scene.add.circle( // TODO: how to destroy it?
      characterProps.x,
      characterProps.y,
      10,
      0x000000,
    );
    shadow.setOrigin(0.5, -1.8);
    shadow.setAlpha(0.6);
    shadow.setScale(0.8, 0.3);
    shadow.setDepth(1);
    this.setFollowShadow(shadow);
    this.character.setDepth(2);

    // actions
    this.idleActions = config.idle_actions;
    this.unavailableActions = config.unavailable_actions;
    this.functionalAction = config.functional_action;

    // temp
    this.hp = hp || defaultHp;

    // define moving limitation
    this.spaceEdge = props.edge || defaultEdge;

    // default animation
    this.handleDefaultIdleAction();

  }

  private handleDefaultIdleAction() {
    if (this.isActing) return;
    this.playAnimation(`${defaultIdlePrefix}-${this.direction}`);
  }

  private async handleBornAction() {
    this.isActing = true;
    const bornAnimation = this.unavailableActions.born.animation;
    await this.playAnimation(bornAnimation);
    this.isActing = false;
    this.isBorn = false;
  }

  private async handleAutomaticAction() {
    if (this.isActing) return;

    const currentAction = selectFromPiority<TIdleAction>(this.idleActions);

    if (currentAction) {
      const currentAnimation = currentAction.has_direction
        ? `${currentAction.animation}-${this.direction}`
        : currentAction.animation;

      if (typeof currentAction.is_move !== 'undefined') {
        this.playAnimation(currentAnimation);
        this.direction = Math.random() > 0.5 ? 'left' : 'right'; // give a random direction
        this.handleMoveDirection(currentAction.animation);
      } else {
        await this.playAnimation(currentAnimation);
        this.handleDefaultIdleAction();
      }
    }
  }

  public handleMoveDirection(animation: string) {
    if (this.isActing) return;

    // change direction if character close to edge
    this.direction =
      this.character.x < this.spaceEdge.from
        ? 'right'
        : this.character.x > this.spaceEdge.to
          ? 'left'
          : this.direction;
    this.isActing = true;
    this.playAnimation(`${animation}-${this.direction}`);
    this.moveDirection(this.direction, defaultMoveDistance, () => {
      this.isActing = false;
      this.handleDefaultIdleAction();
    });
  }

  private async handleUnavailableAction() {
    const animation = this.unavailableActions.egg.animation;
    this.playAnimation(animation);
    this.isActing = false;
  }

  private handleChangeHp(value) {
    const result = this.hp + value;

    this.hp = result >= 100 ? 100 : result <= 0 ? 0 : result;
    setGlobalData('tamagotchi_hp', this.hp);
    this.handleDetectCharacterIsAlive();
  }

  private handleDetectCharacterIsAlive() {
    if (this.isAlive && this.hp <= 0) {
      this.isAlive = false;
    } else if (!this.isAlive && this.hp >= 100) {
      this.isAlive = true;
      this.isBorn = true;
    }
  }

  private fireEachXsec?: number = undefined;

  public startTamagotchi() {
    this.isReady = true;
  }
  public stopTamagotchi() {
    this.isReady = false;
  }

  public runFuntionalAction(
    action: string,
  ): { dialog: TDialogData[] } | undefined {
    if (!this.isAlive || this.isActing) return;

    const currentAction = action === 'sleep' ? this.isSleep ? 'awake' : 'sleep' : action;

    const { point, dialogs } = this.functionalAction[currentAction];

    if (point) {
      const currentHp = this.hp + point;

      // TODO: change hp
      this.hp = currentHp >= 100 ? 100 : currentHp <= 0 ? 0 : currentHp;
      setGlobalData('tamagotchi_hp', this.hp);
    }

    const runAnimation = async () => {
      if (currentAction === 'drink') {
        this.isActing = true;
        this.isSleep && await this.playAnimation('wake-up');

        await this.playAnimation('drink');
        this.isActing = false;
        if (this.isSleep) {
          this.isActing = true;
          await this.playAnimation('lay-down');
          this.playAnimation('sleep');
          this.isActing = false;
        }
        
      } else if (currentAction === 'write') {
        this.isActing = true;
        this.isSleep && await this.playAnimation('wake-up');

        await this.playAnimation('write');
        this.isActing = false;
        if (this.isSleep) {
          this.isActing = true;
          await this.playAnimation('lay-down');
          this.playAnimation('sleep');
          this.isActing = false;
        }

      } else if (currentAction === 'sleep') {
        this.isActing = true;
        await this.playAnimation('lay-down');
        this.playAnimation('sleep');
        this.isActing = false;
        this.isSleep = true;
      } else if (currentAction === 'awake')  {
        this.isActing = true;
        await this.playAnimation('wake-up');
        this.isActing = false;
        this.isSleep = false;
      }
    };

    runAnimation();

    // send dialog back to tamagottchi
    if (dialogs) {
      const { dialog } =
        selectFromPiority<TFunctionalActionDialogItem>(dialogs);
      return { dialog };
    }
  }

  public currentAction = undefined;

  private xSec = defaultXSec;

  public update(time: number) {
    if (!this.isReady) return;
    
    if (this.isActing) {
      this.updatePosition(); // update position trigger at every frame
    }

    // run handler every x secs
    if (Math.floor(time / 1000) % this.xSec === 0) {
      // prevent trigger by each frames in every x secs
      if (Math.floor(time / 1000) / this.xSec == this.fireEachXsec) return;

      // update fireEachXsec value;
      this.fireEachXsec = Math.floor(time / 1000) / this.xSec;

      if (this.isAlive) {
        if (this.isBorn) {
          this.handleBornAction();
        }

        if (!this.isSleep) {
          this.handleChangeHp(defaultDecreaseHpByTime);
          this.handleAutomaticAction();
        }
      } else {
        this.handleChangeHp(defaultRecoverHpByTime);
        this.handleUnavailableAction();
      }
    }
  }
}
