import Phaser from "phaser";

const setting = {
  back: { x: 0, y: 0, width: 160, height: 72 },
  front: { x: 0, y: 72, width: 160, height: 72 },
};

export class CustomDecroation extends Phaser.GameObjects.Container {
  private currentLevel: number = 1;
  private maxLevel: number = 4;
  private customDecroation: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, position: string) {
    // Inherite from scene
    super(scene);

    // const { x, y } = option;
    const { x, y, width, height } = setting[position];

    const { decoration } = scene.cache.json.get("config")["tamagotchi_room"];

    this.maxLevel = decoration.length;

    // Icon
    const backScene = scene.make.sprite({
      key: "tamagotchi_room",
      frame: decoration[3]["back"],
      x: 0,
      y: 0,
    });
    backScene.setOrigin(0, 0);
    backScene.setDisplaySize(160, 72);
    this.add(backScene);

    const leftScene = scene.make.sprite({
      key: "tamagotchi_room",
      frame: decoration[3]["left"],
      x: 0,
      y: 0,
    });
    leftScene.setOrigin(0, 0);
    leftScene.setDisplaySize(80, 144);
    this.add(leftScene);

    const rightScene = scene.make.sprite({
      key: "tamagotchi_room",
      frame: decoration[3]["right"],
      x: 80,
      y: 0,
    });
    rightScene.setOrigin(0, 0);
    rightScene.setDisplaySize(80, 144);
    this.add(rightScene);

    const frontScene = scene.make.sprite({
      key: "tamagotchi_room",
      frame: decoration[3]["front"],
      x: 0,
      y: 72,
    });
    frontScene.setOrigin(0, 0);
    frontScene.setDisplaySize(160, 72);
    this.add(frontScene);

    scene.add.existing(this);
  }

  public upgrade() {
    if (this.currentLevel <= this.maxLevel) {
      this.currentLevel += 1;
      this.customDecroation.setTexture(`room_front_${this.currentLevel}`);
    }
  }
  public downgrade() {
    if (this.currentLevel >= 1) {
      this.currentLevel -= 1;
      this.customDecroation.setTexture(`room_front_${this.currentLevel}`);
    }
  }
}
