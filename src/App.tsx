import { useRef, useState } from "react";
import { PhaserGame } from "@/PhaserGame";
import useTwitchOauth from "@/hooks/useTwitchOauth";
import Console from "@/game/Console";
import ColorPicker from '@/ColorPicker';
import ConfigEditor from '@/ConfigEditor';
import { getStoreState, setStoreState, store } from "@/game/store";
import AutoSaveTrigger from "./AutoSaveTrigger";
import CommandBoard from './CommandBoard';

const isDev = import.meta.env['VITE_ENV'] === 'dev';

function App() {
  const [ isConfigOpen, setIsConfigOpen ] = useState(true);
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
            <div style={{ display: 'flex', width: '100%' }}>

              {/* Side */}
              <div style={{ height: '100vh'}}>
                <ConfigEditor onChange={() => {
                    window.alert('設定已更新，將重新啟動');
                    window.location.reload()
                  }}
                />
              </div>
              
              
              {/* Main */}
              <div style={{
                position: "relative",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                zIndex: 1
              }}>
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
                        { isGameStart && <PhaserGame /> }
                      </Console>
                    </div>
                  </div>
                }
                {/* <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 2 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" defaultChecked={isConfigOpen} onChange={() => setIsConfigOpen(!isConfigOpen)} />
                    <span>Config</span>
                  </label>
                  <AutoSaveTrigger />
                </div> */}
                {/* { isConfigOpen && isGameStart &&
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', padding: '12px', zIndex: 1, backgroundColor: bgColor }}>
                    <div style={{ marginBottom: '12px'}}>
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
                } */}
              </div>
            </div>
      {/* <ColorPicker
        defaultColor={bgColor}
        onChange={color => setBgColor(color)}
      /> */}
    </div>
  );
}

export default App;
