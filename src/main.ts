import { GameEngine } from "./GameEngine";

// Goal is to keep main.ts small and just enough to configure the engine


const gameEngine = new GameEngine()

gameEngine.start().then(() => {
  // Do something after the game starts
  gameEngine.onPostStart()
});
