import { PrimaryDialogue } from '../../components/PrimaryDialogue';
import { Scene } from 'phaser';


export default class TestScene extends Scene {

  constructor() {
    super('Test');
  }

  preload() {
    this.load.setPath('assets');
  }

  private dialogue?: PrimaryDialogue;

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x444444).setOrigin(0.5);

    this.dialogue = new PrimaryDialogue(this);
    this.dialogue.initDialogue();
    const exampleDialogueData = [
      {
        "face": { "key": "avatar_hero", "frame": "" },
        "text": "lorem ipsum dolor sit amet consectetur adipiscing elit"
      }
    ];

    this.dialogue.runDialogue(exampleDialogueData);


  }

  update() {
  }

}
