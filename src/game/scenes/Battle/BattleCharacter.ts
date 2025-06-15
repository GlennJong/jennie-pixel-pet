import Phaser from 'phaser';
import { runTween } from '../../utils/runTween';
import { StatusBoard } from './StatusBoard';
import { Character } from '../../components/Character';
import { TDialogData } from '../../components/PrimaryDialogue';
import { selectFromPiority } from '../../utils/selectFromPiority';

type TDialogItem = {
  piority: number;
  dialog: TDialogData[];
};

export type TEffect = {
  type: 'damage' | 'recover';
  target: 'self' | 'opponent';
  value?: number;
  basic: number;
};

type TReaction = {
  animation: 'damage' | 'recover' | string;
  dialogs: TDialogItem[];
};

type TAction = {
  animation: 'attack' | string;
  dialogs: TDialogItem[];
  piority: number;
  effect: TEffect;
};

type TResult = {
  icon: { key: string; frame: string };
  dialogs: TDialogItem[];
};

export type TRunAction = {
  dialog: TDialogData[];
} & TAction;

export type TRunReaction = {
  dialog: TDialogData[];
  isDead: boolean;
} & TReaction;

export type TRunResult = {
  dialog: TDialogData[];
} & TResult;

const fullWidth = 160;

const defaultCharacterPosition = {
  self: { x: 30, y: 90 },
  opponent: { x: 130, y: 36 },
};

const defaultShadow = {
  self: { x: 30, y: 114, size: 24 },
  opponent: { x: 130, y: 64, size: 16 },
};

const defaultStatusBoardPosition = {
  self: { x: 110, y: 80 },
  opponent: { x: 50, y: 20 },
};

export default class BattleCharacter extends Character {
  public hp: { current: number; max: number } = { current: 0, max: 0 };
  private actions: { [key: string]: TAction };
  private reactions: { [key: string]: TReaction };
  private common: { [key: string]: TDialogItem };
  private results: { [key: string]: TResult };
  private role: 'self' | 'opponent';
  public board: StatusBoard;
  public avaliableActions: string[];
  // private shadow: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    key: string,
    role: 'self' | 'opponent',
  ) {
    // get current character config
    const currentBattleCharacterConfig =
      scene.cache.json.get('config')[key] ||
      scene.cache.json.get('config')['default'];

    if (!currentBattleCharacterConfig) return;

    const { animations, battle } = currentBattleCharacterConfig;

    const characterProps = {
      ...defaultCharacterPosition[role],
      animations: animations,
    };

    super(scene, key, characterProps);

    // set shadow
    // const { x, y, size } = defaultShadow[role];
    // const shadow = scene.add.circle(x, y, size, 0x000000).setVisible(false);

    // shadow.setAlpha(0.5);
    // shadow.setScale(1, 0.25);
    // shadow.setDepth(1);

    // this.shadow = shadow;
    this.character.setDepth(2);

    // define role
    this.role = role;

    // define config
    this.avaliableActions = Object.keys(battle.actions);
    this.actions = battle.actions;
    this.reactions = battle.reactions;
    this.common = battle.common;
    this.results = battle.results;

    // define current action
    this.hp = {
      current: battle.base.max_hp,
      max: battle.base.max_hp,
    };


    // set default character status board and character animation
    const { name } = battle.base;
    const boardPosition = defaultStatusBoardPosition[role];
    this.board = new StatusBoard(scene, boardPosition.x, boardPosition.y, {
      hp: this.hp,
      name,
    });

    this.playAnimation('idle');

    this.getRandomAction();
  }

  public async openingCharacter() {
    const position = defaultCharacterPosition[this.role];
    const distance = this.role === 'self' ? fullWidth : fullWidth * -1;

    this.character.setPosition(position.x + distance, position.y);
    await runTween(this.character, { x: position.x }, 1000);
    // this.shadow.setVisible(true);
  }

  private handlePlayKeyFrameAnimation = async (key: string) => {
    await this.board.setAlpha(0);
    await this.playAnimation(key, 1000);
    this.playAnimation('idle');
    await this.board.setAlpha(1);
  };

  private handlePlayAttackReaction = async () => {
    const distance = this.role === 'self' ? 10 : -10;
    const position = defaultCharacterPosition[this.role];

    await this.board.setAlpha(0);
    await runTween(this.character, { x: position.x + distance }, 200);
    await runTween(this.character, { x: position.x }, 200);
    await this.board.setAlpha(1);
  };

  public runAction(action = 'sp'): TRunAction | undefined {
    const currentAction = this.actions[action];

    if (!currentAction) return;

    const { animation, dialogs } = currentAction;

    // Run key frame animation
    // if (typeof animation !== 'string' && animation.key) {
    //     this.handlePlayKeyFrameAnimation(animation.key);
    // }
    // else if (animation === 'attack') {
    if (animation === 'attack') {
      this.handlePlayAttackReaction();
    } else {
      this.handlePlayKeyFrameAnimation(animation);
    }

    return {
      ...currentAction,
      dialog: selectFromPiority(dialogs).dialog,
    };
  }

  private handlePlayDamageReaction = async (value: number) => {
    function easeInOutCubic(x: number): number {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
    const result = Math.max(0, this.hp.current - value);
    this.hp.current = result;
    await runTween(
      this.character,
      { alpha: 0, repeat: 3 },
      100,
      easeInOutCubic,
    );
    this.character.setAlpha(1);
    await this.board.setHP(this.hp.current);
  };

  private handlePlayRecoverReaction = async (value: number) => {
    const result = Math.min(this.hp.max, this.hp.current + value);
    this.hp.current = result;
    await runTween(this.character, { scale: 1.15, yoyo: 1 }, 200);
    this.character.setScale(1);
    await this.board.setHP(this.hp.current);
  };

  public runReaction(
    reaction = 'damage',
    value: number,
  ): TRunReaction | undefined {
    const currentReaction = this.reactions[reaction];

    if (!currentReaction) return;

    const { animation, dialogs } = currentReaction;

    // Run key frame animation
    if (typeof animation !== 'string' && animation.key) {
      this.handlePlayKeyFrameAnimation(animation.key);
    }
    if (animation === 'damage') {
      this.handlePlayDamageReaction(value);
    } else if (animation === 'recover') {
      this.handlePlayRecoverReaction(value);
    }

    return {
      ...currentReaction,
      dialog: selectFromPiority(dialogs).dialog,
      isDead: this.hp.current <= 0,
    };
  }

  public runResult(action: string): TRunResult | undefined {
    const currentResult = this.results[action];
    if (!currentResult) return;

    if (action === 'lose') {
      this.setAlpha(0.5);
    }
    this.board.setAlpha(0);

    const { dialogs } = currentResult;

    return {
      ...currentResult,
      dialog: selectFromPiority(dialogs).dialog,
    };
  }

  public runStart() {
    const startDialog = this.common['start'];
    if (!startDialog) return;

    return selectFromPiority(startDialog).dialog;
  }

  public runFinish() {
    const finisgDialog = this.common['finish'];
    if (!finisgDialog) return;

    return selectFromPiority(finisgDialog).dialog;
  }

  public getRandomAction() {
    const allAction = Object.keys(this.actions);
    let sumPiority = 0;

    const allActionPoint: { [key: string]: number } = {};

    allAction.forEach((key) => {
      allActionPoint[key] = sumPiority += this.actions[key].piority;
    });

    const randomPoint = sumPiority * Math.random();

    allAction.forEach((key) => {
      allActionPoint[key] = Math.abs(allActionPoint[key] - randomPoint);
    });

    const closestPoint = Math.min(...Object.values(allActionPoint));
    const selectedAction = Object.keys(allActionPoint).find(
      (key) => allActionPoint[key] === closestPoint,
    );

    return selectedAction;
  }

  public characterHandler() {
    this.board.updateStatusBoard();
  }
}
