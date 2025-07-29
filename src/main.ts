import { GameEngine } from "./GameEngine";

// Goal is to keep main.ts small and just enough to configure the engine

const ws = new WebSocket(window.location.origin)

const gameEngine = new GameEngine(ws)

gameEngine.start().then(() => {
  // Do something after the game starts
  gameEngine.onPostStart()
});
