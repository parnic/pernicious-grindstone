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
loader.backgroundColor = "#000";
loader.logo = 'data:image/png;base64,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'
loader.logoWidth = 128;
loader.logoHeight = 128;

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
