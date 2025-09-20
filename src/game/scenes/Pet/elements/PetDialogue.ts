import { setStoreState } from '@/game/store';
import { PrimaryDialogue, TDialogData } from '@/game/components/PrimaryDialogue';
import { selectFromPriority } from '@/game/utils/selectFromPriority';
import { ConfigManager } from '@/game/managers/ConfigManagers';


type TDialogItem = {
  sentences: TDialogData[];
  priority: number;
};

const DEFAULT_CHARACTER_KEY = 'mycharacter';

export class PetDialogue extends Phaser.GameObjects.Container {
  private dialogue: PrimaryDialogue;
  private config;
  
  constructor(scene: Phaser.Scene) {
    super(scene);
    
    this.config = ConfigManager.getInstance().get(`pet.${DEFAULT_CHARACTER_KEY}.actions`);
    
    // Window
    this.dialogue = new PrimaryDialogue(scene);
    this.dialogue.initDialogue({
      onDialogueStart: () => setStoreState('global.is_paused', true),
      onDialogueEnd: () => setStoreState('global.is_paused', false),
    });
  }

  public async runDialogue(dialogues: TDialogItem[], replacement?: { [key: string]: string | number }) {
    if (dialogues && replacement) {
      const selectedDialog = selectFromPriority<TDialogItem>(dialogues);
      const selectedSentences = selectedDialog.sentences.map((_sentence) => {
        let portrait = `${DEFAULT_CHARACTER_KEY}_${_sentence.portrait}`;
        let text = _sentence.text;
        if (replacement) {
          Object.entries(replacement).forEach(([key, value]) => {
            let displayValue = value;
            if (typeof value === 'number') displayValue = Math.abs(value);
            text = text.replaceAll(`{{${key}}}`, String(displayValue));
          });
        }
        return {
          ..._sentence,
          portrait,
          text,
        };
      });
      await this.dialogue.runDialogue(selectedSentences);
    }
    
  }

  public destroy() {
    this.dialogue.destroy();
  } 
}
