import Phaser, { Scene } from 'phaser';
import { canvas } from '../../constants';
import { PrimaryDialogue } from '../../components/PrimaryDialogue';

import BattleCharacter from './BattleCharacter';
import {
  sceneConverter,
  sceneStarter,
} from '../../components/CircleSceneTransition';

const contents = [
  {
    icon: { key: 'tamagotchi_character_afk', frame: 'face-normal' },
    text: 'READY TO BATTLE!',
  },
];
const contents2 = [
  {
    icon: { key: 'tamagotchi_character_afk', frame: 'face-normal' },
    text: '挑戰者是CurryCat!',
  },
];

const finishDialogs = [
  {
    icon: { key: 'tamagotchi_character_afk', frame: 'face-normal' },
    text: '挑戰結束!',
  },
  {
    icon: { key: 'tamagotchi_character_afk', frame: 'face-angry' },
    text: '回到我的小房間!',
  },
];

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
    // this.load.image('background-battle', 'background-battle.png');
  }

  init(data) {
    this.handleInitGameScene(this, data);
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xeeeeee);

    // init
    this.handleStartGameScene();

    sceneStarter(this);
  }

  update() {
    this.self.characterHandler();
    this.opponent.characterHandler();
  }

  private handleInitGameScene(scene: Phaser.Scene, data) {
    // this.background = scene.make.image({
    //     key: 'battle_background',
    //     x: canvas.width/2,
    //     y: canvas.height/2,
    // });

    console.log({data})
    
    // init characters
    this.opponent = new BattleCharacter(
      scene,
      `battle_${data.opponent}_opponent`,
      'opponent',
      {},
    );

    this.self = new BattleCharacter(
      scene,
      'battle_afk_self',
      'self',
      {},
    );

    // default hide status board
    this.self.board.setAlpha(0);
    this.opponent.board.setAlpha(0);

    // init dialogue
    this.dialogue = new PrimaryDialogue(scene);
    this.dialogue.setDepth(99);
  }

  private generateRandomBattleProcess(): TProcess[] {
    const step = Math.floor(Math.random() * 10) + 10;
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
    await this.dialogue.runDialog(finishDialogs);
    sceneConverter(this.scene.scene, 'Room', {
      hp: this.self.hp.current,
      mp: 100,
    });
  }

  private async openingCharacterMovement() {
    this.self.character.setAlpha(0);
    this.opponent.character.setAlpha(0);

    // run self opening animation
    this.self.character.setAlpha(1);
    await this.self.openingCharacter();

    // run battle introduce
    await this.dialogue.runDialog(contents);

    // run opponent opening animation
    this.opponent.character.setAlpha(1);
    await this.opponent.openingCharacter();

    // show status board for both
    this.self.board.setAlpha(1);
    this.opponent.board.setAlpha(1);

    // run battle introduce
    await this.dialogue.runDialog(contents2);
  }
}
