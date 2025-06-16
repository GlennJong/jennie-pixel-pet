import { RoomWindow } from './RoomWindow';
import { RoomRecorder } from './RoomRecorder';
import { CustomDecroation } from './CustomDecroation';

const WINDOW_POSITION = { x: 80, y: 32 };
const RECORDER_POSITION = { x: 26, y: 60 }

export class Property extends Phaser.GameObjects.Container {
  private level: number;
  
  constructor(scene: Phaser.Scene) {
    super(scene);
    
    // Window
    new RoomWindow(scene, WINDOW_POSITION);

    // Recorder
    new RoomRecorder(scene, RECORDER_POSITION);

    // Custom Decroation
    new CustomDecroation(scene);
  }

  create() {
  }


  public update() {
  }

}
