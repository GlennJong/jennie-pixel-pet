import Phaser from 'phaser';

// components
import { Character } from '@/game/components/Character';

// utils
import { selectFromPiority } from '@/game/utils/selectFromPiority';
import { ConfigManager } from '@/game/managers/ConfigManagers';
import { StatusHandler } from '../handlers/StatusHandler';
import { getValueFromColonStoreState } from '@/game/store/helper';

type TDirection = 'none' | 'left' | 'right';

type TAction = {
  animation: string;
  is_move?: boolean;
  has_direction?: boolean;
};

type TIdleness = {
  piority: number;
} & TAction;

const DEFAULT_CHARACTER_KEY = 'afk2';
const DEFAULT_EDGE = { from: 50, to: 120 };

const DEFAULT_TAMAGOTCHI_POSITION = {
  x: 60, y: 68,
  edge: DEFAULT_EDGE
}

const DEFAULT_AUTO_ACTIOIN_DURATION = 3000;
const DEFAULT_IDLE_PREFEX = 'idle';
const DEFAULT_MOVE_DISTANCE = 32;

export class TamagotchiCharacter extends Character {
  private isActing: boolean = false;
  private isReady: boolean = false;

  private idleness: { [key: string]: TIdleness };
  private spaceEdge: { from: number; to: number };
  private direction: TDirection = 'left';

  public activities: { [key: string]: TAction };

  constructor(scene: Phaser.Scene) {

    const config = ConfigManager.getInstance().get(`tamagotchi.${DEFAULT_CHARACTER_KEY}`);

    super(scene, DEFAULT_CHARACTER_KEY, {
      ...DEFAULT_TAMAGOTCHI_POSITION,
      animations: config.animations
    });
    

    this.character.setDepth(2);

    // actions
    this.idleness = config.idleness;
    this.activities = config.activities;

    // define moving limitation
    this.spaceEdge = DEFAULT_TAMAGOTCHI_POSITION.edge;

    // default animation
    this.handleAutomaticAction();
  }

  private getBehavior() {
    const { idle, play } = new StatusHandler().getConfig();
    return { idle, play };
  }
  
  private getIsUnavaliableAll() {
    const { idle } = this.getBehavior();
    return this.isActing || !idle;
  }

  private handleDefaultIdleAction() {
    if (this.getIsUnavaliableAll()) return;
    this.playAnimation(`${DEFAULT_IDLE_PREFEX}-${this.direction}`);
  }

  private async handleAutomaticAction() {
    if (this.isActing) return;

    // Special move
    const { idle, play } = this.getBehavior();
    if (!idle && !!play) {
      this.playAnimation(play);
      return;
    }
    // Idle
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
    const { idle } = this.getBehavior();
    if (!idle) return;

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
    if (!this.autoActionTimer) {
      this.autoActionTimer = this.scene.time.addEvent({
        delay: DEFAULT_AUTO_ACTIOIN_DURATION,
        loop: true,
        callback: () => this.handleAutomaticAction()
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

    const actions = ConfigManager.getInstance().get('tamagotchi.afk2.actions');

    const { plays } = actions[action];

    const currentPlays = getValueFromColonStoreState(plays);
    
    const runAnimation = async (func: () => Promise<void>) => {
      this.isActing = true;
      await func();
      this.isActing = false;
    };
    
    runAnimation(async () => {
      for (let i = 0; i < currentPlays.length; i++) {
        await this.playAnimation(currentPlays[i]);
      }
    });
    
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
