import { getStoreState, setStoreState, store } from "@/game/store";
import { useState } from "react";


function CommandBoard() {
  const [ selectedStateOptionIndex, setSelectedStateOptionIndex ] = useState(0);
  const [ selectedCommandOptionIndex, setSelectedCommandOptionIndex ] = useState(0);
  const stateOptions = [
    { label: '裝潢等級 = 1', key: 'tamagotchi.level', value: () => 1 },
    { label: '角色血量 = 5', key: 'tamagotchi.hp', value: () => 5 },
    { label: '角色血量 + 5', key: 'tamagotchi.hp', value: () => getStoreState('tamagotchi.hp') + 5 },
    { label: '角色金錢 = 0', key: 'tamagotchi.coin', value: () => 0 },
    { label: '角色金錢 + 20', key: 'tamagotchi.coin', value: () => getStoreState('tamagotchi.coin') + 20 },
  ]
  const commandOptions = [
    { label: '補充水分', value: () => handlePushMessage('test', '補充水分') },
    { label: '提醒大家存檔', value: () => handlePushMessage('test', '提醒大家存檔') },
    { label: '貝貝打招呼', value: () => handlePushMessage('test', '貝貝打招呼') },
    { label: '上上打招呼', value: () => handlePushMessage('test', '上上打招呼') },
    { label: '戰鬥：咖哩貓', value: () => handlePushMessage('curry_cat', '上上打招呼') },
    { label: '戰鬥：安迪', value: () => handlePushMessage('jennie_congee', '上上打招呼') },
  ]
  const handlePushMessage = (user: string, content: string) => {
    const myStore = store('global.messageQueue');
    setStoreState('global.messageQueue', [
      ...(Array.isArray(myStore?.get()) ? myStore.get() as { user?: string, content?: string }[] : []),
      { user, content }
    ])
  }

  const handleClickStateButton = () => {
    const currentState = stateOptions[selectedStateOptionIndex];
    setStoreState(currentState.key, currentState.value());
  }
  const handleClickCommandButton = () => {
    const currentState = commandOptions[selectedCommandOptionIndex];
    currentState.value();
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '4px' }}>
        <select onChange={(e) => setSelectedStateOptionIndex(Number(e.target.value))}>
          { stateOptions.map((option, index) => 
            <option key={index} value={index}>{ option.label }</option>
          ) }
        </select>
        <button className="button" onClick={handleClickStateButton}>UPDATE STATUS</button>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <select onChange={(e) => setSelectedCommandOptionIndex(Number(e.target.value))}>
          { commandOptions.map((option, index) => 
            <option key={index} value={index}>{ option.label }</option>
          ) }
        </select>
        <button className="button" onClick={handleClickCommandButton}>RUN COMMAND</button>
      </div>
    </div>
  );
}

export default CommandBoard;
