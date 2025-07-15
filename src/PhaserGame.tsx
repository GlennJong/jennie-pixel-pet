import { useEffect, useRef } from "react";
import StartGame from "./game";
import { loadGame, saveGame } from './game/EventBus';


export const PhaserGame = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  
  useEffect(() => {
    gameRef.current = StartGame('game-container');
    loadGame();
    window.addEventListener('beforeunload', saveGame);
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current === null;
    }
  }, [])
  return <div id="game-container"></div>;
};
