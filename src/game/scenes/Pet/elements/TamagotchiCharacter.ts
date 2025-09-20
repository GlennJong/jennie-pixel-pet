import Phaser from 'phaser';

// components
import { Character } from '@/game/components/Character';

// utils
import { selectFromPriority } from '@/game/utils/selectFromPriority';
import { ConfigManager } from '@/game/managers/ConfigManagers';
import { getValueFromColonStoreState } from '@/game/store/helper';

type TDirection = 'none' | 'left' | 'right';

type TAction = {
  animation: string;
  isMove?: boolean;
  has_direction?: boolean;
};

type TIdleActions = {
  priority: number;
} & TAction;

const DEFAULT_CHARACTER_KEY = 'mycharacter';
const DEFAULT_EDGE = { from: 0, to: 160 };

const DEFAULT_TAMAGOTCHI_POSITION = {
  x: 60, y: 68,
  edge: DEFAULT_EDGE
}

const DEFAULT_AUTO_ACTIOIN_DURATION = 3000;
const DEFAULT_IDLE_PREFEX = 'idle';
const DEFAULT_MOVE_DISTANCE = 24;

export class TamagotchiCharacter extends Character {
  private isActing: boolean = false;
  private isReady: boolean = false;

  private idleActions: { [key: string]: TIdleActions };
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
    this.idleActions = config.idleActions;
    this.activities = config.activities;

    // define moving limitation
    this.spaceEdge = DEFAULT_TAMAGOTCHI_POSITION.edge;

    // default animation
    this.handleAutomaticAction();
  }

  private handleDefaultIdleAction() {
    if (this.isActing) return;
    this.playAnimation(`${DEFAULT_IDLE_PREFEX}-${this.direction}`);
  }

  private async handleAutomaticAction() {
    if (this.isActing) return;

    // Idle
    const currentAction = selectFromPriority<TIdleActions>(this.idleActions);
    const currentAnimation = getValueFromColonStoreState(currentAction.animationSet);

    this.direction = currentAction.direction;

    let isMove = false;
    if (typeof currentAction.isMove !== 'undefined') {
      isMove = getValueFromColonStoreState(currentAction.isMove);
    }

    if (isMove) {
        this.handleMoveDirection(currentAnimation);
    }
    else {
      this.playAnimationSet(currentAnimation, true)
      this.handleDefaultIdleAction();
    }

  }

  public handleMoveDirection(animation: string) {
    this.isActing = true;
    this.playAnimationSet(animation)

    let isMoveDistanceOverEdge = false;
    if (this.direction === 'right') {
      isMoveDistanceOverEdge = this.character.x + DEFAULT_MOVE_DISTANCE > this.spaceEdge.to;
    }
    else if (this.direction === 'left') {
      isMoveDistanceOverEdge = this.character.x - DEFAULT_MOVE_DISTANCE < this.spaceEdge.from;
    }

    if (isMoveDistanceOverEdge) {
      this.isActing = false;
      this.handleDefaultIdleAction();
    }
    else {
      this.moveDirection(this.direction, DEFAULT_MOVE_DISTANCE, () => {
        this.isActing = false;
        this.handleDefaultIdleAction();
      });
    }

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

    const actions = ConfigManager.getInstance().get('tamagotchi.mycharacter.actions');

    const { animationSet } = actions[action];

    const currentAnimationSet = getValueFromColonStoreState(animationSet);
    
    this.playAnimationSet(currentAnimationSet);
    
  }

  private playAnimationSet(animationSet, canInterrupt = false) {
    
    const runAnimation = async (func: () => Promise<void>) => {
      if (!canInterrupt) this.isActing = true;
      await func();
      if (!canInterrupt) this.isActing = false;
      
    };
    
    runAnimation(async () => {
      for (let i = 0; i < animationSet.length; i++) {
        await this.playAnimation(animationSet[i]);
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
