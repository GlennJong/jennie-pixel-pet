import { useEffect } from "react";
import StartGame from "./game";
import { loadGame, saveGame } from './game/EventBus';


export const PhaserGame = () => {
  useEffect(() => {
    StartGame('game-container');
    loadGame();
    window.addEventListener('beforeunload', saveGame);
  }, [])
  return <div id="game-container"></div>;
};
