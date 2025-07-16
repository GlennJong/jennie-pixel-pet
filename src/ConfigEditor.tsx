
import React, { useEffect, useState } from "react";
// 定義 config 型別
interface TamagotchiAfkBattleBase {
  max_hp: number;
  name: string;
}
interface TamagotchiAfkBattle {
  base: TamagotchiAfkBattleBase;
}
interface TamagotchiAfk {
  battle?: TamagotchiAfkBattle;
}
interface Config {
  tamagotchi_afk?: TamagotchiAfk;
  [key: string]: unknown;
}

declare global {
  interface Window {
    globalConfig: Config;
  }
}
window.globalConfig = window.globalConfig || {};

const CONFIG_PATH = "/assets/config.json";

const ConfigEditor: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(CONFIG_PATH)
      .then((res) => res.json())
      .then((data: Config) => {
        setConfig(data);
        window.globalConfig = data;
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!config) return <div>Config not found</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Config 編輯器</h1>
      <h2>tamagotchi_afk</h2>
      <label>
        max_hp:
        <input
          type="number"
          value={config.tamagotchi_afk?.battle?.base?.max_hp ?? ""}
          onChange={(e) => {
            setConfig((prev) => {
              if (!prev) return prev;
              const updated: Config = {
                ...prev,
                tamagotchi_afk: {
                  ...prev.tamagotchi_afk,
                  battle: {
                    ...prev.tamagotchi_afk?.battle,
                    base: {
                      ...prev.tamagotchi_afk?.battle?.base,
                      max_hp: Number(e.target.value),
                      name: prev.tamagotchi_afk?.battle?.base?.name || "",
                    },
                  },
                },
              };
              window.globalConfig = updated;
              return updated;
            });
          }}
        />
      </label>
      {/* 可依需求增加更多欄位 */}
    </div>
  );
};

export default ConfigEditor;
