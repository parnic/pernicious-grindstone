import { TiledResource } from "@excaliburjs/plugin-tiled";
import { FontSource, ImageSource } from "excalibur";

import SilkscreenFont from './Silkscreen-Regular.ttf';

const tiledMapTmx = `stage-01.tmx`;

const spriteSheet = `img/kenney-pixel-shmup/tiles_packed.png`

const imageEnemyType01 = `img/kenney-shape-characters/blue_body_circle.png`;
const imageEnemyType02 = `img/kenney-shape-characters/red_body_square.png`;
const imageEnemyType03 = `img/kenney-shape-characters/purple_body_rhombus.png`;

const imageEnemyFaceHappy = `img/kenney-shape-characters/face_a.png`
const imageEnemyFaceAnnoyed = `img/kenney-shape-characters/face_b.png`
const imageEnemyFaceHopeful = `img/kenney-shape-characters/face_c.png`
const imageEnemyFaceSnarky = `img/kenney-shape-characters/face_d.png`
const imageEnemyFacePlanning = `img/kenney-shape-characters/face_e.png`
const imageEnemyFaceAggressive = `img/kenney-shape-characters/face_f.png`
const imageEnemyFaceAngry = `img/kenney-shape-characters/face_g.png`
const imageEnemyFaceSmirking = `img/kenney-shape-characters/face_h.png`
const imageEnemyFaceSurprised = `img/kenney-shape-characters/face_i.png`
const imageEnemyFaceDead = `img/kenney-shape-characters/face_j.png`
const imageEnemyFaceSurprisedBlinking = `img/kenney-shape-characters/face_k.png`
const imageEnemyFaceHopefulBlinking = `img/kenney-shape-characters/face_l.png`

export const Resources = {
  tiledmap: new TiledResource(tiledMapTmx, {startZIndex: -3}),
  spritesheet: new ImageSource(spriteSheet),
  PixelFont: new FontSource(SilkscreenFont, 'silkscreen')
};

export const ImageResources = {
  enemyBodies: [
    new ImageSource(imageEnemyType01),
    new ImageSource(imageEnemyType02),
    new ImageSource(imageEnemyType03),
  ],
  enemyFaces: {
    happy: new ImageSource(imageEnemyFaceHappy),
    annoyed: new ImageSource(imageEnemyFaceAnnoyed),
    hopeful: new ImageSource(imageEnemyFaceHopeful),
    hopefulBlinking: new ImageSource(imageEnemyFaceHopefulBlinking),
    snarky: new ImageSource(imageEnemyFaceSnarky),
    planning: new ImageSource(imageEnemyFacePlanning),
    aggressive: new ImageSource(imageEnemyFaceAggressive),
    angry: new ImageSource(imageEnemyFaceAngry),
    smirking: new ImageSource(imageEnemyFaceSmirking),
    surprised: new ImageSource(imageEnemyFaceSurprised),
    surprisedBlinking: new ImageSource(imageEnemyFaceSurprisedBlinking),
    dead: new ImageSource(imageEnemyFaceDead),
  }
}
