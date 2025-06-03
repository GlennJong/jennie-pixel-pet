import Phaser from 'phaser';
import { Character } from '../../components/Character';
import { canvas } from '../../constants';
import { selectFromPiority } from '../../utils/selectFromPiority';
import { TDialogData } from '../../components/PrimaryDialogue';

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
type TStatus = { [key: string]: number };
type TamagotchiCharacterProps = {
  x: number;
  y: number;
  edge: { from: number; to: number };
  callbackFunctions: { [key: string]: <T extends number>(props: T) => void };
  hp?: number;
};

const defaultIdlePrefix = 'idle'; // TODO: idle right
const defaultHp = 100;
const defaultRecoverHpByTime = 60;
const defaultDecreaseHpByTime = 1;
const defaultXSec = 5;

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
  private callbackFunctions: {
    [key: string]: <T extends number>(value: T) => void;
  };
  private direction: TDirection = 'left';

  // TODO: direction state
  public status: TStatus = {
    hp: 100,
    mp: 100,
  };

  constructor(scene: Phaser.Scene, props: TamagotchiCharacterProps) {
    const key = 'tamagotchi_afk'; // static character here

    const { tamagotchi_afk } = scene.cache.json.get('config'); // get current character config

    const characterProps = {
      ...props,
      animations: tamagotchi_afk.animations,
    };

    super(scene, key, characterProps);

    const { hp, callbackFunctions } = props;

    // set character depth\
    this.setDepth(1);

    const shadow = scene.add.circle(
      characterProps.x,
      characterProps.y,
      10,
      0x000000,
    );
    shadow.setOrigin(0.5, -1.8);
    shadow.setAlpha(0.6);
    shadow.setScale(0.8, 0.3);
    shadow.setDepth(1);
    this.character.setDepth(2);
    this.setFollowShadow(shadow);

    // actions
    this.idleActions = tamagotchi_afk.idle_actions;

    // unavailable actions
    this.unavailableActions = tamagotchi_afk.unavailable_actions;

    this.functionalAction = tamagotchi_afk.functional_action;

    // temp
    this.status.hp = hp || defaultHp;

    // define moving limitation
    this.spaceEdge = props.edge || { from: 0, to: canvas.width };

    // default animation
    this.handleDefaultIdleAction();

    // defined callback function
    this.callbackFunctions = callbackFunctions;
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
      // reset action after moved
      this.isActing = false;
      this.handleDefaultIdleAction();
    });
  }

  private async handleUnavailableAction() {
    const animation = this.unavailableActions.egg.animation;
    this.playAnimation(animation);
    this.isActing = false;
  }

  private handleRecoverHpByTime() {
    const result = this.status.hp + defaultRecoverHpByTime;

    // TODO: change hp
    this.status.hp = result >= 100 ? 100 : result <= 0 ? 0 : result;
    this.callbackFunctions.onHpChange(this.status.hp);
    this.handleDetectCharacterIsAlive();
  }

  private handleDecreaseHpByTime() {
    const result = this.status.hp - defaultDecreaseHpByTime;

    // TODO: change hp
    this.status.hp = result >= 100 ? 100 : result <= 0 ? 0 : result;
    this.callbackFunctions.onHpChange(this.status.hp);
    this.handleDetectCharacterIsAlive();
  }

  private handleDetectCharacterIsAlive() {
    if (this.isAlive && this.status.hp <= 0) {
      this.isAlive = false;
    } else if (!this.isAlive && this.status.hp >= 100) {
      this.isAlive = true;
      this.isBorn = true;
    }
  }

  private fireEachXsec?: number = undefined;

  // public manualContolDirection(direction: 'left' | 'right' ) {
  //     if (this.isActing) return;

  //     // change direction if character close to edge
  //     direction = this.character.x < this.spaceEdge.from ? 'right' : this.character.x > this.spaceEdge.to ? 'left' : direction;
  //     this.isActing = true;
  //     this.playAnimation(`walk-${direction}`);
  //     this.moveDirection(direction, defaultMoveDistance, () => {

  //         // reset action after moved
  //         this.isActing = false;
  //         this.handleDefaultIdleAction();
  //     });
  // }

  public runFuntionalAction(
    action: string,
  ): { dialog: TDialogData[] } | undefined {
    if (!this.isAlive || this.isActing) return;

    const { point, dialogs } = this.functionalAction[action];

    if (point) {
      const currentHp = this.status.hp + point;

      // TODO: change hp
      this.status.hp = currentHp >= 100 ? 100 : currentHp <= 0 ? 0 : currentHp;
      this.callbackFunctions.onHpChange(this.status.hp);
    }

    const runAnimation = async () => {
      if (action === 'drink') {
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
        
      } else if (action === 'write') {
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

      } else if (action === 'sleep') {
        this.isSleep = !this.isSleep;
        if (this.isSleep) {
          this.isActing = true;
          await this.playAnimation('lay-down');
          this.playAnimation('sleep');
          this.isActing = false;
        } else {
          this.isActing = true;
          await this.playAnimation('wake-up');
          this.isActing = false;
        }
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

  public characterHandler(time: number) {
    // update position trigger at every frame
    if (this.isActing) {
      this.updatePosition();
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
          this.handleDecreaseHpByTime();
          this.handleAutomaticAction();
        }
      } else {
        this.handleRecoverHpByTime();
        this.handleUnavailableAction();
      }
    }
  }
}
