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

    // const drink = this.make.sprite({
    //   key: 'tamagotchi_header_icons',
    //   frame: 'drink-1',
    //   x: 50,
    //   y: 80,
    // }).setOrigin(0);

    // this.make.sprite({
    //   key: 'tamagotchi_header_icons',
    //   frame: 'sleep-1',
    //   x: 60,
    //   y: 80,
    // }).setOrigin(0);

    // this.make.sprite({
    //   key: 'tamagotchi_afk',
    //   frame: 'face_angry',
    //   x: 60,
    //   y: 90,
    // }).setOrigin(0);

    // this.dialogue.runDialogue(exampleDialogueData);


  }

  update() {
  }

}
