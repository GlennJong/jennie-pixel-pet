import Phaser, { Scene } from 'phaser';
import { PrimaryDialogue } from '../../components/PrimaryDialogue';

import BattleCharacter from './BattleCharacter';
import {
  sceneConverter,
  sceneStarter,
} from '../../components/CircleSceneTransition';
import { originalHeight, originalWidth } from '../../constants';
import { getStoreState, setStoreState } from '@/game/store';

type TProcess = {
  from: 'self' | 'opponent';
  damage: number;
  action: string;
};

export default class Battle extends Scene {
  background?: Phaser.GameObjects.Rectangle;
  self?: BattleCharacter;
  opponent?: BattleCharacter;
  dialogue?: PrimaryDialogue;

  constructor() {
    super('Battle');
  }

  preload() {
    this.load.setPath('assets');
  }

  create() {
    
    // background
    this.background = this.add.rectangle(0, 0, originalWidth, originalHeight, 0xeeeeee).setOrigin(0);

    const transmit = getStoreState('global.transmit') || {};
    const opponent = transmit.opponent || 'default';

    // init characters
    this.opponent = new BattleCharacter(
      this,
      `battle_${opponent}_opponent`,
      'opponent',
    );

    this.self = new BattleCharacter(
      this,
      'battle_afk_self',
      'self',
    );

    // default hide status board
    this.self.board.setAlpha(0);
    this.opponent!.board.setAlpha(0);

    // init dialogue
    this.dialogue = new PrimaryDialogue(this);
    this.dialogue.initDialogue();
    this.dialogue.setDepth(99);

    sceneStarter(this);
    this.handleStartGameScene();

    this.events.on('shutdown', this.shutdown, this);
  }

  update() {
    this.self!.characterHandler();
    this.opponent!.characterHandler();
  }

  private generateRandomBattleProcess(): TProcess[] {
    // const step = Math.floor(Math.random() * 10) + 10;
    const step = 999;
    const result: TProcess[] = [];

    for (let i = 0; i < step; i++) {
      result.push({
        from: ['self', 'opponent'][i % 2],
      });
    }

    return result;
  }

  private async applyBattle(process: TProcess[]) {
    for (let i = 0; i < process.length; i++) {
      const { from } = process[i];

      // action movement
      const actionCharacter = from === 'self' ? this.self : this.opponent;

      const currentAction = actionCharacter!.getRandomAction();
      
      const actionResult = actionCharacter!.runAction(currentAction);
      if (!actionResult) return;
      
      const { effect, dialog: actionDialog } = actionResult;
      
      if (!effect) return;

      const { type, target, value } = effect;
      await this.dialogue!.runDialogue(actionDialog);

      // reaction movement
      const sufferCharacter = target === 'self' ? this.self : this.opponent;
      const reactionResult = sufferCharacter!.runReaction(type, value || 0);

      if (!reactionResult) return;
      const { dialog: sufferDialog, isDead } = reactionResult;
      await this.dialogue!.runDialogue(sufferDialog);

      if (isDead) {
        const winResult = actionCharacter!.runResult('win');
        if (!winResult) return;
        const { dialog: winnerDialog } = winResult;
        await this.dialogue!.runDialogue(winnerDialog);

        sufferCharacter!.runResult('lose');
        const loseResult = sufferCharacter!.runResult('lose');

        
        if (!loseResult) return;
        const { dialog: loserDialog } = loseResult;
        await this.dialogue!.runDialogue(loserDialog);

        this.handleFinishGame();
        return;
      }
    }
  }

  private async handleStartGameScene() {
    await this.openingCharacterMovement();
    const process = this.generateRandomBattleProcess();
    this.applyBattle(process);
  }

  private async handleFinishGame() {
    const selfFinishDialog = this.self!.runFinish();
    await this.dialogue!.runDialogue(selfFinishDialog);
    setStoreState('pet.win', this.self!.hp.current > 0 ? 1 : -1);
    sceneConverter(this, 'Pet');
  }

  private async openingCharacterMovement() {
    this.self!.character.setAlpha(0);
    this.opponent!.character.setAlpha(0);

    // run self opening animation
    this.self!.character.setAlpha(1);
    await this.self!.openingCharacter();

    // run battle introduce
    const selfStartDialog = this.self!.runStart();
    await this.dialogue!.runDialogue(selfStartDialog);

    // run opponent opening animation
    this.opponent!.character.setAlpha(1);
    await this.opponent!.openingCharacter();

    const opponentStartDialog = this.opponent!.runStart();
    await this.dialogue!.runDialogue(opponentStartDialog);

    // show status board for both
    this.self!.board.setAlpha(1);
    this.opponent!.board.setAlpha(1);

  }
  shutdown() {
    this.opponent!.destroy();
    this.self!.destroy();
  }
}
