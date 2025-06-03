import { useRef, useState } from "react";
import { PhaserGameRef, PhaserGame } from "./game/PhaserGame";

function App() {
  const phaserRef = useRef<PhaserGameRef | null>(null);
  const [ isGameStart, setIsGameStart ] = useState(false)
  return (
    <div id="app">
      <div style={{ zIndex: 1, position: "relative" }}>
        <button onClick={() => setIsGameStart(true)}>click</button>
        { isGameStart &&
          <PhaserGame ref={phaserRef} currentActiveScene={undefined} />
        }
      </div>
    </div>
  );
}

export default App;
