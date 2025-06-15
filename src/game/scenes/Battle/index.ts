import Phaser, { Scene } from 'phaser';
import { PrimaryDialogue } from '../../components/PrimaryDialogue';

import BattleCharacter from './BattleCharacter';
import { getGlobalData, setGlobalData } from '../../EventBus';
import {
  sceneConverter,
  sceneStarter,
} from '../../components/CircleSceneTransition';

type TProcess = {
  from: 'self' | 'opponent';
  damage: number;
  action: string;
};

export default class Battle extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  self: BattleCharacter;
  opponent: BattleCharacter;
  dialogue: PrimaryDialogue;

  constructor() {
    super('Battle');
  }

  preload() {
    this.load.setPath('assets');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xeeeeee);

    const opponent = getGlobalData('battle_opponent') || 'default';

    console.log({ opponent })
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
    this.opponent.board.setAlpha(0);

    // init dialogue
    this.dialogue = new PrimaryDialogue(this);
    this.dialogue.setDepth(99);

    sceneStarter(this);
    this.handleStartGameScene();

  }

  update() {
    this.self.characterHandler();
    this.opponent.characterHandler();
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

      const currentAction = actionCharacter.getRandomAction();
      
      const actionResult = actionCharacter.runAction(currentAction);
      if (!actionResult) return;
      
      const { effect, dialog: actionDialog } = actionResult;
      
      if (!effect) return;

      const { type, target, value } = effect;
      await this.dialogue.runDialog(actionDialog, true);

      // reaction movement
      const sufferCharacter = target === 'self' ? this.self : this.opponent;
      const reactionResult = sufferCharacter.runReaction(type, value || 0);

      if (!reactionResult) return;
      const { dialog: sufferDialog, isDead } = reactionResult;
      await this.dialogue.runDialog(sufferDialog, true);

      if (isDead) {
        const winResult = actionCharacter.runResult('win');
        if (!winResult) return;
        const { dialog: winnerDialog } = winResult;
        await this.dialogue.runDialog(winnerDialog, true);

        sufferCharacter.runResult('lose');
        const loseResult = sufferCharacter.runResult('lose');

        
        if (!loseResult) return;
        const { dialog: loserDialog } = loseResult;
        await this.dialogue.runDialog(loserDialog);

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
    const selfFinishDialog = this.self.runFinish();
    await this.dialogue.runDialog(selfFinishDialog);
    setGlobalData('battle_result', this.self.hp.current > 0 ? 'win' : 'lose');
    sceneConverter(this, 'Tamagotchi');
  }

  private async openingCharacterMovement() {
    this.self.character.setAlpha(0);
    this.opponent.character.setAlpha(0);

    // run self opening animation
    this.self.character.setAlpha(1);
    await this.self.openingCharacter();

    // run battle introduce
    const selfStartDialog = this.self.runStart();
    await this.dialogue.runDialog(selfStartDialog);

    // run opponent opening animation
    this.opponent.character.setAlpha(1);
    await this.opponent.openingCharacter();

    const opponentStartDialog = this.opponent.runStart();
    await this.dialogue.runDialog(opponentStartDialog);

    // show status board for both
    this.self.board.setAlpha(1);
    this.opponent.board.setAlpha(1);

  }
}
