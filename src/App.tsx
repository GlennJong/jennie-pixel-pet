import { useRef, useState } from "react";
import { PhaserGame } from "@/PhaserGame";
import useTwitchOauth from "@/hooks/useTwitchOauth";
import Console from "@/game/Console";
import ColorPicker from '@/ColorPicker';
import ConfigEditor from '@/ConfigEditor';
import { setStoreState, store } from "@/game/store";
import AutoSaveTrigger from "./AutoSaveTrigger";
import CommandBoard from './CommandBoard';

type TRecord = {
  user?: string;
  content?: string;
  createdAt?: Date;
}

function App() {
  const [ counter, setCounter ] = useState(0);
  const [ isConfigOpen, setIsConfigOpen ] = useState(false);
  const [ isLogOpen, setIsLogOpen ] = useState(false);
  const [ isCmdOpen, setIsCmdOpen ] = useState(false);
  const [ isConnected, setIsConnected ] = useState(false);
  // const [ isGameStart, setIsGameStart ] = useState(false);
  const { twitchState, startOauthConnect, startWebsocket } = useTwitchOauth();
  const [ record, setRecord ] = useState<TRecord[]>([]);
  const [ bgColor, setBgColor ] = useState('#482e79');
  const recordRef = useRef<TRecord[]>([]);

  const handleClickConnectButton = async () => {
    startWebsocket('chat', {
      onMessage: (data) => {
        const { user, content, createdAt }: TRecord = data;
        handlePushMessage(user || '', content || '');
        recordRef.current.push({ user, content, createdAt });
        setRecord(recordRef.current);
      }
    });
    // setIsGameStart(true);
    setIsConnected(true);
    setCounter(counter + 1);
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
        <div style={{ position: 'absolute', right: '0', top: '0', padding: '4px 12px', display: 'flex', gap: '4px', zIndex: 2 }}>
          
          <button
            className={`button ${isConfigOpen ? 'open' : ''}`}
            disabled={!!twitchState}
            onClick={startOauthConnect}
          >
            { twitchState ? 'LOGINED' : 'LOGIN TWITCH'}
          </button>
          <button
            className={`button ${isConfigOpen ? 'open' : ''}`}
            onClick={() => setIsConfigOpen(!isConfigOpen)}
          >
            CONFIG
          </button>
          <button
            className={`button ${isLogOpen ? 'open' : ''}`}
            onClick={() => setIsLogOpen(!isLogOpen)}
          >
            LOG
          </button>
          <button
            className={`button ${isCmdOpen ? 'open' : ''}`}
            onClick={() => setIsCmdOpen(!isCmdOpen)}
          >
            CMD
          </button>
        </div>

        {/* Side */}
        { isConfigOpen &&
          <div style={{ height: '100vh'}}>
            <ConfigEditor onChange={() => {
                window.alert('設定已更新，將重新啟動');
                setCounter(counter + 1);
                // window.location.reload()
              }}
            />
          </div>
        }
        
        {/* Main */}
        <div style={{
          position: "relative",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          zIndex: 1
        }}>
          {/* <div key={counter}>
            <Console>
              <PhaserGame />
            </Console>
          </div> */}
          {/* {
            !twitchState &&
            <button className="button" onClick={startOauthConnect}>Twitch login</button>
          } */}
          <div key={counter} style={{ position: 'relative' }}>
            { (twitchState && !isConnected) &&
              <button
                className="button"
                onClick={handleClickConnectButton}
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 2, boxShadow: '2px 4px 12px hsla(0, 0%, 0%, .33)' }}>
                  Start Connect
              </button>
            }
            <div style={{ opacity: (!twitchState || isConnected) ? 1 : 0.5, pointerEvents: (!twitchState || isConnected) ? 'auto': 'none' }}>
              <Console>
                { (!twitchState || isConnected) && <PhaserGame /> }
              </Console>
            </div>
          </div>
          
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '0', right: '0', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', width: '100%' }}>
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', width: '100%'}}>
          <AutoSaveTrigger />
          { isCmdOpen && <CommandBoard /> }
          <ColorPicker
            defaultColor={bgColor}
            onChange={color => setBgColor(color)}
          />
        </div>
        {/* { isLogOpen && isGameStart && */}
        { isLogOpen &&
          <div style={{ width: '100%', padding: '12px 36px', zIndex: 1, backgroundColor: 'hsla(0, 0%, 0%, .5)', overflowY: 'auto', maxHeight: '100px' }}>
            <div style={{ marginBottom: '12px'}}>
            </div>
            <div>
              { record.map((_record, i) => 
                <div key={i}>
                  {_record.user}: {_record.content}: {_record.createdAt}
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
