import Phaser from 'phaser';

type TOption = {
  x: number;
  y: number;
};

export class RoomRecorder extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, option: TOption) {
    // Inherite from scene
    super(scene);

    const { x, y } = option;

    // Icon
    const recorder = scene.make.sprite({
      key: 'tamagotchi_room',
      frame: 'recorder_2',
      x: x,
      y: y,
    });

    // const recorderShadow = scene.make.sprite({
    //     key: 'tamagotchi_room',
    //     frame: 'recorder_shadow',
    //     x: x - 3,
    //     y: y + 15,
    // });

    if (!scene.anims.exists('room_recoreder_animation')) {
      scene.anims.create({
        key: 'room_recoreder_animation',
        frames: scene.anims.generateFrameNames('tamagotchi_room', {
          prefix: `recorder_`,
          start: 1,
          end: 12,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }


    recorder.play('room_recoreder_animation');

    // this.add(recorderShadow);
    this.add(recorder);

    scene.add.existing(this);
  }
}
