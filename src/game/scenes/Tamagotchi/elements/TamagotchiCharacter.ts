import Phaser from 'phaser';
import { store, Store } from '@/game/store';

// components
import { Character } from '@/game/components/Character';

// utils
import { selectFromPiority } from '@/game/utils/selectFromPiority';

type TDirection = 'none' | 'left' | 'right';

type TAction = {
  animation: string;
  is_move?: boolean;
  has_direction?: boolean;
};

type TIdleness = {
  piority: number;
} & TAction;

const DEFAULT_CHARACTER_KEY = 'tamagotchi_afk';
const DEFAULT_EDGE = { from: 50, to: 120 };

const DEFAULT_TAMAGOTCHI_POSITION = {
  x: 60, y: 68,
  edge: DEFAULT_EDGE
}

const DEFAULT_AUTO_ACTIOIN_DURATION = 3000;
const DEFAULT_IDLE_PREFEX = 'idle';
const DEFAULT_MOVE_DISTANCE = 32;

export class TamagotchiCharacter extends Character {
  private isAliveState?: Store<boolean> = store('tamagotchi.isAlive');
  private isSleepState?: Store<boolean> = store('tamagotchi.isSleep');
  
  private isActing: boolean = false;
  private isReady: boolean = false;

  private idleness: { [key: string]: TIdleness };
  private spaceEdge: { from: number; to: number };
  private direction: TDirection = 'left';
  private hpState?: Store<number>;

  public activities: { [key: string]: TAction };

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
    
    this.character.setDepth(2);

    // actions
    this.idleness = config.idleness;
    this.activities = config.activities;

    // define moving limitation
    this.spaceEdge = DEFAULT_TAMAGOTCHI_POSITION.edge;

    // default animation
    if (this.isAliveState?.get()) {
      this.handleDefaultIdleAction();
    }
    else {
      this.playAnimation('egg');
    }

  }
  private getIsUnavaliableAll() {
    return this.isActing || !this.isAliveState?.get() || this.isSleepState?.get();
  }

  private getIsUnavaliableIdle() {
    return this.isActing || !this.isAliveState?.get();
  }

  private handleDefaultIdleAction() {
    if (this.getIsUnavaliableAll()) return;
    this.playAnimation(`${DEFAULT_IDLE_PREFEX}-${this.direction}`);
  }

  private async handleAutomaticAction() {
    if (this.getIsUnavaliableAll()) return;

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
    if (this.getIsUnavaliableIdle()) return;

    // change direction if character close to edge
    this.direction =
      this.character.x < this.spaceEdge.from
        ? 'right'
        : this.character.x > this.spaceEdge.to
          ? 'left'
          : this.direction;
    this.isActing = true;
    this.playAnimation(`${animation}-${this.direction}`);
    this.moveDirection(this.direction, DEFAULT_MOVE_DISTANCE, () => {
      this.isActing = false;
      this.handleDefaultIdleAction();
    });
  }

  private autoActionTimer?: Phaser.Time.TimerEvent;

  public startTamagotchi() {
    this.isReady = true;
    // 啟動自動行為 timer
    if (!this.autoActionTimer) {
      this.autoActionTimer = this.scene.time.addEvent({
        delay: DEFAULT_AUTO_ACTIOIN_DURATION,
        loop: true,
        callback: () => {
          const isAlive = this.isAliveState?.get();
          const isSleep = this.isSleepState?.get();
          if (isAlive && !isSleep) {
            this.handleAutomaticAction();
          }
        }
      });
    }
  }
  public stopTamagotchi() {
    this.isReady = false;
    if (this.autoActionTimer) {
      this.autoActionTimer.remove();
      this.autoActionTimer = undefined;
    }
  }

  public runFuntionalAction(action: string) {
    if (this.isActing) return;

    const isAlive = this.isAliveState?.get();
    const isSleep = this.isSleepState?.get();

    if (!isAlive && action !== 'born') return;

    if ((isSleep && action == 'sleep') || (!isSleep && action === 'awake')) return;

    const needWakeUp = isSleep && action !== 'sleep' && action !== 'awake';

    const actionList = {
      drink: {
        play: async () => {
          await this.playAnimation('drink')
        },
        state: () => {},
      },
      write: {
        play: async () => {
          await this.playAnimation('write')
        },
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
        play: async () => {
          await this.playAnimation('wake-up');
        },
        state: () => this.isSleepState?.set(false)
      },
      dead: {
        play: async () => {
          this.playAnimation('egg');
        },
        state: () => this.isAliveState?.set(false),
      },
      born: {
        play: async () => {
          await this.playAnimation('born');
          this.playAnimation('idle-left');
        },
        state: () => this.isAliveState?.set(true),
      },
    }

    const runAnimation = async (func: () => Promise<void>) => {
      this.isActing = true;
      await func();
      this.isActing = false;
    };

    if (action in actionList) {
      if (needWakeUp) {
        runAnimation(async () => {
          await actionList.awake.play();
          await actionList[action as keyof typeof actionList].play();
          await actionList.sleep.play();
          actionList[action as keyof typeof actionList].state();
        });
      } else {
        runAnimation(async () => {
          await actionList[action as keyof typeof actionList].play();
          actionList[action as keyof typeof actionList].state();
        });
      }
    }

  }
  public async runFuntionalActionAsync(action: string) {
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
    this.runFuntionalAction(action);
  }



  public update() {
    if (!this.isReady) return;
    if (this.isActing) this.updatePosition();
  }

  public destroy() {
    if (this.autoActionTimer) {
      this.autoActionTimer.remove();
      this.autoActionTimer = undefined;
    }
    super.destroy();
  }
}
