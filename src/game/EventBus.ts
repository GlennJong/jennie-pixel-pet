import { Events } from 'phaser';

// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const EventBus = new Events.EventEmitter();

const globalState = {
    tamagotchi_hp: 100,
    tamagotchi_coin: 0,
    tamagotchi_level: 1,
    tamagotchi_queue: [],
    message_queue: [],
    battle_opponent: 'default',
    battle_result: null,
};

const LOCAL_STORAGE_KEY = 'phaser_game_save_state';

export function saveGame(): void {
    try {
        const serializedState = JSON.stringify(globalState);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
        console.log('Game state saved to localStorage:', globalState);
    } catch (error) {
        console.error('Failed to save game state to localStorage:', error);
    }
}

export function loadGame(): void {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            console.log('No saved game state found in localStorage. Starting with default state.');
            // Optionally, reset globalState to its initial defaults here if not already
            // This is handled by the initial `globalState` definition.
            return;
        }
        const loadedState: GlobalState = JSON.parse(serializedState);

        // Update globalState properties individually to trigger updates via setGlobalData
        // This ensures the EventBus events are fired for each changed property
        let stateChanged = false;
        for (const key in loadedState) {
            if (Object.keys(globalState).includes(key) && globalState[key as keyof GlobalState] !== loadedState[key as keyof GlobalState]) {
                // Directly mutate globalState for load, setGlobalData will save again later
                globalState[key as keyof GlobalState] = loadedState[key as keyof GlobalState];
                stateChanged = true;
            }
        }
        // After loading, manually emit update events for all relevant parts of the state
        // This ensures all UI components (Phaser and React) react to the loaded data
        if (stateChanged) {
            console.log('Game state loaded from localStorage:', globalState);
            EventBus.emit('global-data-updated', { key: 'score', value: globalState.score, oldValue: 0 } as GlobalDataUpdatePayload); // Old value can be dummy
            EventBus.emit('global-data-updated', { key: 'playerLives', value: globalState.playerLives, oldValue: 0 } as GlobalDataUpdatePayload);
            EventBus.emit('global-data-updated', { key: 'levelName', value: globalState.levelName, oldValue: '' } as GlobalDataUpdatePayload);
            // You might need a more sophisticated way to handle oldValue for initial load
        } else {
             console.log('Loaded state is identical to current state, no updates triggered.');
        }


    } catch (error) {
        console.error('Failed to load game state from localStorage:', error);
    }
}

// Function to update global data and emit an event
export function setGlobalData<K extends keyof GlobalState>(key: K, value: GlobalState[K]): void {
    if (Object.keys(globalState).includes(key)) {
        const oldValue = globalState[key]; // Capture old value for potential use in handlers
        globalState[key] = value;
        // Emit an event whenever global data is updated
        EventBus.emit(`${key}-updated`, value);
        console.log(`Global data updated: ${key} = ${value} (from ${oldValue})`);
        // Automatically save game state after any global data change
        // saveGame();
    } else {
        console.warn(`Attempted to set unknown global data key: ${key}`);
    }
}

// Function to get global data
export function getGlobalData(key) {
    return globalState[key];
}

export function setupGlobalEventListener(sceneInstance: Phaser.Scene & {
    globalEventStatusText: Phaser.GameObjects.Text | null;
    globalEventCounter: number;
    _globalEventHandler?: (message: string) => void;
}): void {
    if (!sceneInstance._globalEventHandler) {
        sceneInstance._globalEventHandler = (message: string) => {
            if (sceneInstance.globalEventStatusText) {
                sceneInstance.globalEventStatusText.setText(`Global Event: ${message}`);
                sceneInstance.globalEventCounter++;
            }
            console.log(`${sceneInstance.sys.settings.key} received global-event:`, message);
        };

        EventBus.on('global-event', sceneInstance._globalEventHandler, sceneInstance);

        sceneInstance.events.on('shutdown', () => {
            EventBus.off('global-event', sceneInstance._globalEventHandler, sceneInstance);
            console.log(`${sceneInstance.sys.settings.key} shutdown: global-event listener removed.`);
            delete sceneInstance._globalEventHandler;
        });
    }
}
