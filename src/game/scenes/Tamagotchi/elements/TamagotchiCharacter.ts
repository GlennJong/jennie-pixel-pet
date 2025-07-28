import Phaser from 'phaser';
import { Character } from '@/game/components/Character';
import { selectFromPiority } from '@/game/utils/selectFromPiority';
import { TDialogData } from '@/game/components/PrimaryDialogue';
import { store, Store } from '@/game/store';

type TDirection = 'none' | 'left' | 'right';

type TFunctionalActionDialogItem = {
  sentences: TDialogData[];
  piority: number;
};

type TAction = {
  animation: string;
  is_move?: boolean;
  has_direction?: boolean;
};

type TIdleness = {
  piority: number;
} & TAction;

type TActivity = {
  point: number;
  dialogs?: TFunctionalActionDialogItem[];
} & TAction;


const DEFAULT_CHARACTER_KEY = 'tamagotchi_afk';
const DEFAULT_CHARACTER_HP = 100;

const DEFAULT_TAMAGOTCHI_POSITION = {
  x: 60,
  y: 68,
  edge: { from: 50, to: 120 }
}

const defaultIdlePrefix = 'idle'; // TODO: idle right
const defaultXSec = 3;
const defaultEdge = { from: 50, to: 120 };

// TODO: low hp status...
const defaultMoveDistance = 32;

export class TamagotchiCharacter extends Character {
  private isAliveState?: Store<boolean> = store('tamagotchi.isAlive');
  private isSleepState?: Store<boolean> = store('tamagotchi.isSleep');
  
  private isAlive: boolean = true;
  private isSleep: boolean = false;
  private isBorn: boolean = false;
  private isActing: boolean = false;
  private isReady: boolean = false;


  private idleness: { [key: string]: TIdleness };
  private spaceEdge: { from: number; to: number };
  private direction: TDirection = 'left';
  private hpState?: Store<number>;

  public activities: { [key: string]: TActivity };
  public hp: number;


  constructor(scene: Phaser.Scene) {

    // get current character config
    const config = scene.cache.json.get('config').tamagotchi[DEFAULT_CHARACTER_KEY]; 
    
    super(scene, DEFAULT_CHARACTER_KEY, {
      ...DEFAULT_TAMAGOTCHI_POSITION,
      animations: config.animations
    });
    
    // global state handler
    this.hpState = store('tamagotchi.hp');
    if (!this.hpState) console.warn('Global hp state not found, please check MainScene.ts');
    
    this.hp = this.hpState?.get() || DEFAULT_CHARACTER_HP;

    this.character.setDepth(2);

    // actions
    this.idleness = config.idleness;
    this.activities = config.activities;

    // define moving limitation
    this.spaceEdge = DEFAULT_TAMAGOTCHI_POSITION.edge || defaultEdge;

    // default animation
    this.handleDefaultIdleAction();

  }
  private getIsAvaliable() {
    return this.isAliveState?.get() && this.isSleepState?.get();
  }

  private handleDefaultIdleAction() {
    if (this.isActing || !this.isAliveState?.get()) return;
    this.playAnimation(`${defaultIdlePrefix}-${this.direction}`);
  }

  private async handleAutomaticAction() {
    const isUnavaliable = this.getIsAvaliable();
    if (this.isActing || isUnavaliable) return;

    const currentAction = selectFromPiority<TIdleness>(this.idleness);

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
    const isUnavaliable = this.getIsAvaliable();
    if (this.isActing || isUnavaliable) return;

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

  private fireEachXsec?: number = undefined;

  public startTamagotchi() {
    this.isReady = true;
  }
  public stopTamagotchi() {
    this.isReady = false;
  }

  public runFuntionalAction(
    action: string,
    user: string,
  ): { dialog: TDialogData[] } | undefined {
    if (this.isActing) return;

    const isAlive = this.isAliveState?.get();
    const isSleep = this.isSleepState?.get();

    if (!isAlive && action !== 'born') return;

    if ((isSleep && action == 'sleep') || (!isSleep && action === 'awake')) return;

    const needWakeUp = isSleep && action !== 'sleep' && action !== 'awake';

    const result = this.activities[action];

    const list = {
      drink: {
        play: async () => await this.playAnimation('drink'),
        state: () => {},
      },
      write: {
        play: async () => await this.playAnimation('write'),
        state: () => {},
      },
      sleep: {
        play: async () => {
          await this.playAnimation('lay-down');
          this.playAnimation('sleep');
        },
        state: () => this.isSleepState?.set(true),
      },
      awake: {
        play: async () => await this.playAnimation('wake-up'),
        state: () => this.isSleepState?.set(false)
      },
      dead: {
        play: async () => this.playAnimation('egg'),
        state: () => this.isAliveState?.set(false),
      },
      born: {
        play: async () => await this.playAnimation('born'),
        state: () => this.isAliveState?.set(true),
      },
    }

    const runAnimation = async (func: () => Promise<void>) => {
      this.isActing = true;
      await func();
      this.isActing = false;
    };

    if (action in list) {
      if (needWakeUp) {
        runAnimation(async () => {
          await list.awake.play();
          await list[action as keyof typeof list].play();
          await list.sleep.play();
          list[action as keyof typeof list].state();
        });
      } else {
        runAnimation(async () => {
          await list[action as keyof typeof list].play();
          list[action as keyof typeof list].state();
        });
      }
    }

    // send dialog back to tamagottchi
    const { dialogs } = result;
    
    if (dialogs && user) {
      const selectedDialog = selectFromPiority<TFunctionalActionDialogItem>(dialogs);
      const selectedSentences = selectedDialog.sentences.map((_sentence) => ({
        ..._sentence,
        text: _sentence.text.replaceAll('{{user_name}}', user),
      }))
      result.sentences = selectedSentences;
    }
    
    return result;
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
          // this.handleBornAction();
        }

        if (!this.isSleep) {
          // this.handleChangeHp(defaultDecreaseHpByTime);
          this.handleAutomaticAction();
        }
      }
    }
  }

  public async runFuntionalActionAsync(action: string, user?: string): Promise<{ dialog: TDialogData[] } | undefined> {
    await new Promise<void>(resolve => {
      const timer = this.scene.time.addEvent({
        delay: 50,
        loop: true,
        callback: () => {
          if (!this.isActing) {
            timer.remove();
            resolve();
          }
        }
      });
    });
    return this.runFuntionalAction(action, user);
  }

}
