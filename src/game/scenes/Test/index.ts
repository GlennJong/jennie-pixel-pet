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

    const padding = 4;
    const background = this.make
      .nineslice({
        key: 'battle_board',
        frame: 'background',
        width: 64,
        height: 20,
        leftWidth: 4,
        rightWidth: 4,
        topHeight: 4,
        bottomHeight: 4,
        x: 10,
        y: 10
      })
      .setOrigin(0);

    const hpBarHead = this.make.sprite({
      key: 'battle_board',
      frame: 'bar-head',
        x: 10 + padding,
        y: 10 + padding
      
    }).setOrigin(0);

    const hpFrame = this.make
      .nineslice({
        key: 'battle_board',
        frame: 'bar-frame',
        width: 40,
        height: hpBarHead.height,
        leftWidth: 2,
        rightWidth: 2,
        topHeight: 2,
        bottomHeight: 2,
        x: 10 + padding + hpBarHead.width,
        y: 10 + padding
      })
      .setOrigin(0);
    // this.add(background);

    const hpBar = this.make
      .sprite({
        key: 'battle_board',
        frame: 'bar',
        x: 10 + padding + hpBarHead.width + 1,
        y: 10 + padding + 2,
      })
      // .setDisplaySize(20, 2)
      .setOrigin(0);
      hpBar.displayWidth = 20

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
