import React, { useEffect, useState } from "react";
import JsonEditor from './JsonEditor';
import { battleSceneHideKey, battleSceneWording, mappingHideKey, mappingWording, tamagotchiSceneHideKey, tamagotchiSceneWording, templates } from "./config.constants";

const CONFIG_PATH = "/assets/config.json";
const LOCAL_KEY = "custom_config";


const ConfigEditor = ({ onChange } : { onChange: () => void }): JSX.Element => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：優先 localStorage -> fetch
  useEffect(() => {
    handleGetConfigData();
  }, []);

  const handleGetConfigData = () => {
    const local = localStorage.getItem(LOCAL_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        setConfig(parsed);
        setLoading(false);
        return;
      } catch {}
    }
    fetch(CONFIG_PATH)
      .then((res) => res.json())
      .then((data: Config) => {
        setConfig(data);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
        setLoading(false);
      });
  };

  // reset: 清除 state, localStorage 並 refetch
  const handleClickResetButton = () => {
    setLoading(true);
    setConfig(null);
    localStorage.removeItem(LOCAL_KEY);
    fetch(CONFIG_PATH)
      .then((res) => res.json())
      .then((data: Config) => {
        setConfig(data);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
        setLoading(false);
      });
  };

  const handleClickSaveButton = () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(config));
    onChange();
  };

  const handleClickCancelButton = () => {
    handleGetConfigData()
  };

  if (loading) return <div>Loading...</div>;
  if (!config) return <div>Config not found</div>;

  return (
    <div style={{ position: 'relative', padding: '32px 0', minWidth: '400px', boxSizing: 'border-box' }}>
      <div style={{ fontWeight: 'bold', padding: '0 12px', fontSize: '16px', marginBottom: '6px' }}>Config Editor（土炮版）</div>
      <div style={{ display: 'flex', padding: '0 12px', justifyContent: 'flex-start', gap: '4px', marginBottom: '12px' }}>
        <button className="button" onClick={handleClickSaveButton}>SAVE</button>
        <button className="button" onClick={handleClickCancelButton}>CANCEL</button>
        <button className="button" onClick={handleClickResetButton}>RESET</button>
      </div>
      <JsonEditor
        title="忠誠點數對應設定"
        wording={mappingWording}
        hide={mappingHideKey}
        value={config.mapping}
        onChange={data => {
          config.mapping = data;
          setConfig({...config});
        }}
      />
      <JsonEditor
        title="放置遊戲角色：基本設定"
        wording={tamagotchiSceneWording}
        template={templates}
        hide={tamagotchiSceneHideKey}
        value={config.tamagotchi.tamagotchi_afk.base}
        onChange={data => {
          config.tamagotchi.tamagotchi_afk.base = data;
          setConfig({...config});
        }}
      />
      <JsonEditor
        title="放置遊戲角色：角色靜止設定"
        wording={tamagotchiSceneWording}
        template={templates}
        hide={tamagotchiSceneHideKey}
        value={config.tamagotchi.tamagotchi_afk.idleness}
        onChange={data => {
          config.tamagotchi.tamagotchi_afk.idleness = data;
          setConfig({...config});
        }}
      />
      <JsonEditor
        title="放置遊戲角色：角色活動設定"
        wording={tamagotchiSceneWording}
        template={templates}
        hide={tamagotchiSceneHideKey}
        value={config.tamagotchi.tamagotchi_afk.activities}
        hintPic={{
          hp: 'https://placehold.co/600x400/EEE/31343C?text=[hint]',
          dialogs: 'https://placehold.co/600x400/EEE/31343C?text=[hint]',
          sentences: 'https://placehold.co/600x400/EEE/31343C?text=[hint]'
        }}
        onChange={data => {
          config.tamagotchi.tamagotchi_afk.activities = data;
          setConfig({...config});
        }}
      />
      <JsonEditor
        title="放置遊戲房間"
        wording={{
          decoration: '房間裝飾',
          cost: '花費',
          level: '等級'
        }}
        template={templates}
        hide={[ 'key', 'preload', 'frame', 'recorder', 'window' ]}
        value={config.tamagotchi.tamagotchi_room}
        onChange={data => {
          config.tamagotchi.tamagotchi_room = data;
          setConfig({...config});
        }}
      />
      <JsonEditor
        title="戰鬥角色設定"
        wording={battleSceneWording}
        hide={battleSceneHideKey}
        value={config.battle}
        onChange={data => {
          config.battle = data;
          setConfig({...config});
        }}
      />
    </div>
  );
};

export default ConfigEditor;
