import React, { useEffect, useState } from "react";
import JsonEditor from './JsonEditor';

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
    <div style={{ position: 'relative', padding: '24px 0', minWidth: '400px', boxSizing: 'border-box' }}>
      <div style={{ fontWeight: 'bold', padding: '0 12px', fontSize: '16px', marginBottom: '6px' }}>Config Editor（土炮版）</div>
      <div style={{ display: 'flex', padding: '0 12px', justifyContent: 'flex-start', gap: '4px', marginBottom: '12px' }}>
        <button className="button" onClick={handleClickSaveButton}>SAVE</button>
        <button className="button" onClick={handleClickCancelButton}>CANCEL</button>
        <button className="button" onClick={handleClickResetButton}>RESET</button>
      </div>
      {/* <JsonEditor
        title="忠誠點數對應設定"
        wording={{
          drink: '讓角色喝水',
          write: '讓角色寫字',
          sleep: '讓角色睡覺/起床',
          battle_currycat: '角色戰鬥：currycat',
          battle_jennie: '角色戰鬥：jennie',
          battle_beibei: '角色戰鬥：貝貝',
          battle_shangshang: '角色戰鬥：上上',
          action: '遊戲內指令',
          matches: '配對條件',
          content: '忠誠點數中文名稱'
        }}
        hide={['action', 'params']}
        value={config.mapping}
        onChange={data => {
          config.mapping = data;
          setConfig({...config});
        }}
      /> */}
      {/* <JsonEditor
        title="放置遊戲設定"
        wording={{
          idleness: '靜止時行動',
          activities: '功能性行動',
          idle: '靜止',
          stare: '偷看',
          walk: '走路',
          wink: '扎眼睛',
          drink: '讓角色喝水',
          write: '讓角色寫字',
          battle: '讓角色戰鬥',
          sleep: '讓角色睡覺（停止自動扣血）',
          awake: '讓角色起床（啟動自動扣血）',
          point: "恢復血量",
          base: "基本設定",
          sentences: "對話句子",
          piority: "優先度（越高越容易觸發）",
          face: "表情",
          dialogs: "對話集",
          dialog: "對話",
          frame: "frame",
          text: "對話文字",
          start: "戰鬥開始",
          finish: "戰鬥結束",
          buy: "買東西（自動觸發）",
          win: "戰鬥結束：勝利",
          lose: "戰鬥結束：敗北",
        }}
        template={{
          sentences: {
            face: {
              key: 'tamagotchi_afk',
              frame: 'face_normal'
            },
            text: '對話文字'
          }
        }}
        hide={['key', 'preload', 'animations', 'animation', 'has_direction', 'tamagotchi_room']}
        value={config.tamagotchi}
        onChange={data => {
          config.tamagotchi = data;
          setConfig({...config});
        }}
      /> */}
      <JsonEditor
        title="喝水設定"
        wording={{
          idleness: '靜止時行動',
          activities: '功能性行動',
          idle: '靜止',
          stare: '偷看',
          walk: '走路',
          wink: '扎眼睛',
          drink: '讓角色喝水',
          write: '讓角色寫字',
          battle: '讓角色戰鬥',
          sleep: '讓角色睡覺（停止自動扣血）',
          awake: '讓角色起床（啟動自動扣血）',
          point: "恢復血量",
          base: "基本設定",
          sentences: "對話句子",
          piority: "優先度（越高越容易觸發）",
          face: "表情",
          dialogs: "對話集",
          dialog: "對話",
          frame: "frame",
          text: "對話文字",
          start: "戰鬥開始",
          finish: "戰鬥結束",
          buy: "買東西（自動觸發）",
          win: "戰鬥結束：勝利",
          lose: "戰鬥結束：敗北",
        }}
        hide={['key', 'preload', 'animations', 'animation', 'has_direction', 'tamagotchi_room']}
        template={{
          dialogs: {
            sentences: [
              {
                face: {
                  key: 'tamagotchi_afk',
                  frame: 'face_normal'
                },
                text: '對話文字',
              },
            ],
            piority: 0
          },
          sentences: {
            face: {
              key: 'tamagotchi_afk',
              frame: 'face_normal'
            },
            text: '對話文字'
          }
        }}
        value={config.tamagotchi.tamagotchi_afk.activities.drink}
        onChange={data => {
          config.tamagotchi.tamagotchi_afk.activities.drink = data;
          setConfig({...config});
          // setByPath(newConfigRef.current, 'tamagotchi.tamagotchi_afk.activities.drink', data)
        }}
      />
      {/* <JsonEditor
        title="戰鬥角色設定"
        wording={{
          battle_default_opponent: "預設敵方角色",
          battle_currycat_opponent: "敵方角色：currycat",
          battle_bbb_opponent: "敵方角色：BBB",
          battle_touching_opponent: "敵方角色：touching",
          battle_jennie_opponent: "敵方角色：jennie",
          battle_beibei_opponent: "敵方角色：貝貝",
          battle_shangshang_opponent: "敵方角色：上上",
          battle_afk_self: "我方角色：AFK君",
          base: "基本設定",
          actions: "行動",
          reactions: "反應",
          common: "一般",
          results: "結果",
          piority: "優先度（越高越容易觸發）",
          face: "表情",
          dialogs: "對話集",
          dialog: "對話",
          frame: "frame(angry, normal, sad)",
          text: "對話文字",
          effect: "效果",
          type: "類型",
          target: "對象",
          value: "數值",
          attack: "攻擊",
          damage: "受傷",
          recover: "恢復",
          start: "戰鬥開始",
          finish: "戰鬥結束",
        }}
        hide={['key', 'preload', 'animations', 'animation']}
        value={config.battle}
        onChange={data => {
          config.battle = data;
          setConfig({...config});
        }}
      /> */}
    </div>
  );
};

export default ConfigEditor;
