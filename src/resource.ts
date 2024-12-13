import { TiledResource } from "@excaliburjs/plugin-tiled";
import { ImageSource } from "excalibur";

import imageEnemyType01 from '../img/kenney-shape-characters/blue_body_circle.png'
import imageEnemyType02 from '../img/kenney-shape-characters/red_body_square.png'
import imageEnemyType03 from '../img/kenney-shape-characters/purple_body_rhombus.png'

import imageEnemyFaceHappy from '../img/kenney-shape-characters/face_a.png'
import imageEnemyFaceAnnoyed from '../img/kenney-shape-characters/face_b.png'
import imageEnemyFaceHopeful from '../img/kenney-shape-characters/face_c.png'
import imageEnemyFaceSnarky from '../img/kenney-shape-characters/face_d.png'
import imageEnemyFacePlanning from '../img/kenney-shape-characters/face_e.png'
import imageEnemyFaceAggressive from '../img/kenney-shape-characters/face_f.png'
import imageEnemyFaceAngry from '../img/kenney-shape-characters/face_g.png'
import imageEnemyFaceSmirking from '../img/kenney-shape-characters/face_h.png'
import imageEnemyFaceSurprised from '../img/kenney-shape-characters/face_i.png'
import imageEnemyFaceDead from '../img/kenney-shape-characters/face_j.png'
import imageEnemyFaceSurprisedBlinking from '../img/kenney-shape-characters/face_k.png'
import imageEnemyFaceHopefulBlinking from '../img/kenney-shape-characters/face_l.png'

import tmxPath from '../res/stage-01.tmx';
import spriteSheet from '../img/kenney-pixel-shmup/tiles_packed.png';
import tsxPath from '../res/kenney-pixel-shmup.tsx';

export const Resources = {
  tiledmap: new TiledResource(tmxPath, {
    pathMap: [
      { path: 'tiles_packed.png', output: spriteSheet },
      { path: 'kenney-pixel-shmup.tsx', output: tsxPath }
    ]
  }),
  spritesheet: new ImageSource(spriteSheet),
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
