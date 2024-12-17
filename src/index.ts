import { Color, DisplayMode, Engine, Loader } from "excalibur";
import { ImageResources, Resources, SfxResources } from "./resource";
import { calculateExPixelConversion } from "./ui";
import { SceneManager } from "./scene-manager";
import { Audio } from "./utilities/audio";

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
  physics: false,
});

calculateExPixelConversion(engine.screen);

const loader = new Loader();

for (const resource of Object.values(Resources)) {
  loader.addResource(resource);
}

for (const resourceVal of Object.values(ImageResources)) {
  for (const resource of Object.values(resourceVal)) {
    loader.addResource(resource);
  }
}

for (const resourceVal of Object.values(SfxResources)) {
  for (const resource of resourceVal) {
    loader.addResource(resource);
  }
}

// need a click on the screen in order to allow audio to play...sigh
// loader.suppressPlayButton = true;

Audio.init();

engine.screen.events.on('resize', () => calculateExPixelConversion(engine.screen));
engine.start(loader).then(() => {
  const firstScene = SceneManager.getFirstSceneData();
  SceneManager.goToScene(firstScene, engine);

  Audio.playMusic();
});
