import { useRef, useState } from "react";
import { PhaserGame } from "@/PhaserGame";
import useTwitchOauth from "@/hooks/useTwitchOauth";
import Console from "@/game/Console";
import ColorPicker from '@/ColorPicker';
import ConfigEditor from '@/ConfigEditor';
import { getStoreState, setStoreState, store } from "@/game/store";
import AutoSaveTrigger from "./AutoSaveTrigger";

const isDev = import.meta.env['VITE_ENV'] === 'dev';

function App() {
  const [ isConfigOpen, setIsConfigOpen ] = useState(true);
  const [ isAutoSaved, setIsAutoSaved ] = useState(false);
  const [ isGameStart, setIsGameStart ] = useState(true);
  const { twitchState, startOauthConnect, startWebsocket } = useTwitchOauth();
  const [ record, setRecord ] = useState<{user?: string, content?: string}[]>([]);
  const [ bgColor, setBgColor ] = useState('#482e79');
  const recordRef = useRef<{user?: string, content?: string}[]>([]);

  const handleClickConnectButton = async () => {
    startWebsocket('chat', {
      onMessage: (data) => {
        const { user, content }: {user?: string, content?: string} = data;
        handlePushMessage(user || '', content || '');
        recordRef.current.push({ user, content });
        setRecord(recordRef.current);
      }
    });
    setIsGameStart(true);
  }

  const handlePushMessage = (user: string, content: string) => {
    const myStore = store('global.messageQueue');
    setStoreState('global.messageQueue', [
      ...(Array.isArray(myStore?.get()) ? myStore.get() as { user?: string, content?: string }[] : []),
      { user, content }
    ])
  }

  
  return (
    <div id="app" style={{ background: bgColor }}>
      <div style={{ zIndex: 1, position: "relative" }}>
        {
          twitchState &&
          <button className="button" onClick={startOauthConnect}>Twitch login</button>
        }
        { !twitchState &&
          <div style={{ position: 'relative' }}>
            { !isGameStart &&
              <button
                className="button"
                onClick={handleClickConnectButton}
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 2, boxShadow: '2px 4px 12px hsla(0, 0%, 0%, .33)' }}>
                  Start Connect
              </button>
            }
            <div style={{ opacity: !isGameStart ? 0.5 : 1, pointerEvents: isGameStart ? 'auto': 'none' }}>
              <Console>
                { isGameStart &&
                  <PhaserGame />
                }
              </Console>
            </div>
          </div>
        }
        <div  style={{ position: 'fixed', bottom: '12px', right: '12px', zIndex: 2 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input type="checkbox" defaultChecked={isConfigOpen} onChange={() => setIsConfigOpen(!isConfigOpen)} />
            <span>Config</span>
          </label>
          <AutoSaveTrigger />
        </div>
        { isConfigOpen && isGameStart &&
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', padding: '12px', zIndex: 1, backgroundColor: bgColor }}>
            {/* <div style={{ marginBottom: '12px'}}>
              <ConfigEditor />
            </div> */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '12px' }}>
              <button className="button" onClick={() => setStoreState('tamagotchi.level', 1)}>level=1</button>
              <button className="button" onClick={() => setStoreState('tamagotchi.coin', 0)}>coin=0</button>
              <button className="button" onClick={() => setStoreState('tamagotchi.coin', getStoreState('tamagotchi.coin') + 20)}>coin+20</button>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-start' }}>
              <button className="button" onClick={() => handlePushMessage('test', '補充水分')}>補充水分</button>
              <button className="button" onClick={() => handlePushMessage('test', '貝貝打招呼')}>battle 貝貝</button>
              <button className="button" onClick={() => handlePushMessage('test', '上上打招呼')}>battle 上上</button>
              <button className="button" onClick={() => handlePushMessage('curry_cat', '上上打招呼')}>battle curry_cat</button>
              <button className="button" onClick={() => handlePushMessage('jennie_congee', '上上打招呼')}>battle jennie_congee</button>
            </div>
            <div>
              { twitchState && JSON.stringify(twitchState) }
              { record.map((_record, i) => 
                <div key={i}>
                  {_record.user}: {_record.content}
                </div>
              ) }
            </div>
          </div>
        }
      </div>
      <ColorPicker
        defaultColor={bgColor}
        onChange={color => setBgColor(color)}
      />
    </div>
  );
}

export default App;
