import { setStoreState } from '@/game/store';
import { PrimaryDialogue, TDialogData } from '@/game/components/PrimaryDialogue';
import { selectFromPiority } from '@/game/utils/selectFromPiority';


type TDialogItem = {
  sentences: TDialogData[];
  piority: number;
};

const DEFAULT_CHARACTER_KEY = 'tamagotchi_afk';

export class TamagotchiDialogue extends Phaser.GameObjects.Container {
  private dialogue: PrimaryDialogue;
  private config;
  
  constructor(scene: Phaser.Scene) {
    super(scene);
    
    this.config = scene.cache.json.get('config').tamagotchi[DEFAULT_CHARACTER_KEY].activities || {};
    
    // Window
    this.dialogue = new PrimaryDialogue(scene);
    this.dialogue.initDialogue({
      onDialogueStart: () => setStoreState('global.isPaused', true),
      onDialogueEnd: () => setStoreState('global.isPaused', false),
    });
  }

  public async runDialogue(action: string, params?: { [key: string]: string | number }) {
    const result = this.config[action];
    const { dialogs, hp, coin } = result;
    const replacement = {...{ hp, coin }, ...params};

    console.log(replacement)

    if (dialogs && replacement) {
      const selectedDialog = selectFromPiority<TDialogItem>(dialogs);
      const selectedSentences = selectedDialog.sentences.map((_sentence) => {
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
