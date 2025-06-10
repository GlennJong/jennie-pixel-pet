import { useRef, useState } from "react";
import { PhaserGameRef, PhaserGame } from "./game/PhaserGame";
import useTwitchOauth from "./hooks/useTwitchOauth";
import { EventBus } from "./game/EventBus";

const isDev = import.meta.env['VITE_ENV'] === 'dev';


function App() {
  const phaserRef = useRef<PhaserGameRef | null>(null);
  const [ isGameStart, setIsGameStart ] = useState(false)
  const { twitchState, startOauthConnect, startWebsocket } = useTwitchOauth();
  const [ record, setRecord ] = useState<{user?: string, content?: string}[]>([]);
  const recordRef = useRef<{user?: string, content?: string}[]>([]);

  const handleClickConnectButton = async () => {
    startWebsocket('chat', {
      onMessage: (data) => {
        const { user, content } = data;
        EventBus.emit('queue', { user, content });
        recordRef.current.push({ user, content });
        setRecord(recordRef.current);
      }
    });
    setIsGameStart(true);
  }

  const handleClickManualBattle = (user: string, content: string) => {
    EventBus.emit('queue', {user, content});
  }

  
  return (
    <div id="app">
      
      <div style={{ zIndex: 1, position: "relative" }}>
        {
          !twitchState &&
          <button className="button" onClick={startOauthConnect}>Twitch login</button>
        }
        { (!isGameStart && twitchState) &&
          <button className="button" onClick={handleClickConnectButton}>Start Connect</button>
        }
        { isGameStart &&
          <PhaserGame ref={phaserRef} currentActiveScene={undefined} />
        }
        { isDev && isGameStart &&
          <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <button className="button" onClick={() => handleClickManualBattle('test', 'demo_dead')}>HP=3</button>
              <button className="button" onClick={() => handleClickManualBattle('test', 'demo_live')}>HP=100</button>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
              <button className="button" onClick={() => handleClickManualBattle('test', '貝貝打招呼')}>battle 貝貝</button>
              <button className="button" onClick={() => handleClickManualBattle('test', '上上打招呼')}>battle 上上</button>
              <button className="button" onClick={() => handleClickManualBattle('bloloblolo', '貝貝打招呼')}>battle BBB</button>
              <button className="button" onClick={() => handleClickManualBattle('touching0212', '貝貝打招呼')}>battle 踏青</button>
              <button className="button" onClick={() => handleClickManualBattle('curry_cat', '貝貝打招呼')}>battle curry_cat</button>
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
    </div>
  );
}

export default App;
