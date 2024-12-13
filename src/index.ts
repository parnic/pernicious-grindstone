import { Color, DisplayMode, Engine, Loader } from "excalibur";
import { ImageResources, Resources } from "./resource";
import { GameScene } from "./scenes/game-scene";
import { calculateExPixelConversion } from "./ui";

const engine = new Engine({
  canvasElementId: 'game',
  width: 1920 / 4,
  height: 1080 / 4,
  displayMode: DisplayMode.FitScreen,
  pixelRatio: 2,
  backgroundColor: new Color(0xdf, 0xf6, 0xf5, 1),
  suppressConsoleBootMessage: true,
  antialiasing: false,
  suppressHiDPIScaling: false,
  snapToPixel: true,
});

calculateExPixelConversion(engine.screen);

engine.add("game-scene", new GameScene());

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

engine.screen.events.on('resize', () => calculateExPixelConversion(engine.screen));
engine.start(loader).then(() => {
  engine.goToScene("game-scene");
});
