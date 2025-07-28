import { setStoreState } from '@/game/store';
import { PrimaryDialogue } from '@/game/components/PrimaryDialogue';

const DEFAULT_CHARACTER_KEY = 'tamagotchi_afk';

export class TamagotchiDialogue extends Phaser.GameObjects.Container {
  private dialogue: PrimaryDialogue;
  
  constructor(scene: Phaser.Scene) {
    const config = scene.cache.json.get('config').tamagotchi[DEFAULT_CHARACTER_KEY]; 
    
    super(scene);
    
    // Window
    this.dialogue = new PrimaryDialogue(scene);
    this.dialogue.initDialogue({
      onDialogueStart: () => setStoreState('global.isPaused', true),
      onDialogueEnd: () => setStoreState('global.isPaused', false),
    });
  }

  public runDialogue() {

  }

  public destroy() {
    this.dialogue.destroy();
  } 
}
