import { DisplayMode, Engine, Loader } from "excalibur";
import { ImageResources, Resources } from "./resource";
import { GameScene } from "./scenes/game-scene";

const engine = new Engine({
  width: 1920 / 4,
  height: 1080 / 4,
  displayMode: DisplayMode.FitScreen,
  pixelRatio: 2,
  suppressConsoleBootMessage: true,
});

engine.add("game-scene", new GameScene());
engine.goToScene("game-scene");

const loader = new Loader();
for (const resource of Object.values(Resources)) {
  loader.addResource(resource);
}
for (const resource of Object.values(ImageResources.enemyBodies)) {
  loader.addResource(resource);
}
for (const resource of Object.values(ImageResources.enemyFaces)) {
  loader.addResource(resource);
}

loader.suppressPlayButton = true;

engine.start(loader);
