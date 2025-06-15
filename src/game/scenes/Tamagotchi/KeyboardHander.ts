export default class KeyboardHandler {
  constructor(scene, { onLeft, onRight, onSpace }) {
    this.scene = scene;
    this.onLeft = onLeft;
    this.onRight = onRight;
    this.onSpace = onSpace;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      if (this.onLeft) this.onLeft();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      if (this.onRight) this.onRight();
    }
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.onSpace) this.onSpace();
    }
  }
}