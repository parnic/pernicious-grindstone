import { TiledResource } from "@excaliburjs/plugin-tiled";
import { FontSource, ImageSource, Sound } from "excalibur";

import imageEnemyType01 from '../img/kenney-shape-characters/blue_body_circle.png'
import imageEnemyType02 from '../img/kenney-shape-characters/red_body_square.png'
import imageEnemyType03 from '../img/kenney-shape-characters/purple_body_rhombus.png'
import imageEnemyType04 from '../img/kenney-shape-characters/green_body_square.png'

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

import stage01Path from '../res/stage-01.tmx';
import stage02Path from '../res/stage-02.tmx';
import stage03Path from '../res/stage-03.tmx';
import spriteSheet from '../img/kenney-pixel-shmup/tiles_packed.png';
import tsxPath from '../res/kenney-pixel-shmup.tsx';

import SilkscreenFont from './fonts/Silkscreen-Regular.ttf';

import impactSfx01 from '../sound/sfx/impacts/zapsplat_impacts_body_hit_punch_or_kick_whoosh_001_90395.mp3'
import impactSfx02 from '../sound/sfx/impacts/zapsplat_impacts_body_hit_punch_or_kick_whoosh_002_90396.mp3'
import impactSfx03 from '../sound/sfx/impacts/zapsplat_impacts_body_hit_punch_or_kick_whoosh_003_90397.mp3'
import impactSfx04 from '../sound/sfx/impacts/zapsplat_impacts_body_hit_punch_or_kick_whoosh_004_90398.mp3'

import reachedExitSfx from '../sound/sfx/ui/mixkit-game-bonus-reached-2065.wav'

import cellSelectedSfx01 from '../sound/sfx/ui/select01.wav'
import cellSelectedSfx02 from '../sound/sfx/ui/select02.wav'
import cellSelectedSfx03 from '../sound/sfx/ui/select03.wav'
import cellSelectedSfx04 from '../sound/sfx/ui/select04.wav'
import cellSelectedSfx05 from '../sound/sfx/ui/select05.wav'
import cellSelectedSfx06 from '../sound/sfx/ui/select06.wav'
import cellSelectedSfx07 from '../sound/sfx/ui/select07.wav'
import cellSelectedSfx08 from '../sound/sfx/ui/select08.wav'
import cellSelectedSfx09 from '../sound/sfx/ui/select09.wav'
import cellSelectedSfx10 from '../sound/sfx/ui/select10.wav'
import cellSelectedSfx11 from '../sound/sfx/ui/select11.wav'
import cellSelectedSfx12 from '../sound/sfx/ui/select12.wav'
import cellSelectedSfx13 from '../sound/sfx/ui/select13.wav'
import cellSelectedSfx14 from '../sound/sfx/ui/select14.wav'
import cellSelectedSfx15 from '../sound/sfx/ui/select15.wav'
import cellSelectedSfx16 from '../sound/sfx/ui/select16.wav'
import cellSelectedSfx17 from '../sound/sfx/ui/select17.wav'
import cellSelectedSfx18 from '../sound/sfx/ui/select18.wav'
import cellSelectedSfx19 from '../sound/sfx/ui/select19.wav'
import cellSelectedSfx20 from '../sound/sfx/ui/select20.wav'
import cellSelectedSfx21 from '../sound/sfx/ui/select21.wav'
import cellSelectedSfx22 from '../sound/sfx/ui/select22.wav'

import bgm01 from '../sound/music/chip-mode-danijel-zambo-main-version-1431-02-05.mp3'
import bgm02 from '../sound/music/game-over-danijel-zambo-main-version-1394-02-03.mp3'
import bgm03 from '../sound/music/itty-bitty-8-bit-kevin-macleod-main-version-7983-03-13.mp3'

export const Resources = {
  stage01: new TiledResource(stage01Path, {
    startZIndex: -10,
    pathMap: [
      { path: 'tiles_packed.png', output: spriteSheet },
      { path: 'kenney-pixel-shmup.tsx', output: tsxPath }
    ]
  }),
  stage02: new TiledResource(stage02Path, {
    startZIndex: -10,
    pathMap: [
      { path: 'tiles_packed.png', output: spriteSheet },
      { path: 'kenney-pixel-shmup.tsx', output: tsxPath }
    ]
  }),
  stage03: new TiledResource(stage03Path, {
    startZIndex: -10,
    pathMap: [
      { path: 'tiles_packed.png', output: spriteSheet },
      { path: 'kenney-pixel-shmup.tsx', output: tsxPath }
    ]
  }),
  spritesheet: new ImageSource(spriteSheet),
  PixelFont: new FontSource(SilkscreenFont, 'Silkscreen')
};

export const ImageResources = {
  enemyBodies: [
    new ImageSource(imageEnemyType01),
    new ImageSource(imageEnemyType02),
    new ImageSource(imageEnemyType03),
    new ImageSource(imageEnemyType04),
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

export const SfxResources = {
  impacts: [
    new Sound(impactSfx01),
    new Sound(impactSfx02),
    new Sound(impactSfx03),
    new Sound(impactSfx04),
  ],
  reachedExit: [
    new Sound(reachedExitSfx),
  ],
  cellSelected: [
    new Sound(cellSelectedSfx01),
    new Sound(cellSelectedSfx02),
    new Sound(cellSelectedSfx03),
    new Sound(cellSelectedSfx04),
    new Sound(cellSelectedSfx05),
    new Sound(cellSelectedSfx06),
    new Sound(cellSelectedSfx07),
    new Sound(cellSelectedSfx08),
    new Sound(cellSelectedSfx09),
    new Sound(cellSelectedSfx10),
    new Sound(cellSelectedSfx11),
    new Sound(cellSelectedSfx12),
    new Sound(cellSelectedSfx13),
    new Sound(cellSelectedSfx14),
    new Sound(cellSelectedSfx15),
    new Sound(cellSelectedSfx16),
    new Sound(cellSelectedSfx17),
    new Sound(cellSelectedSfx18),
    new Sound(cellSelectedSfx19),
    new Sound(cellSelectedSfx20),
    new Sound(cellSelectedSfx21),
    new Sound(cellSelectedSfx22),
  ],
  bgm: [
    new Sound(bgm01),
    new Sound(bgm02),
    new Sound(bgm03),
  ],
}
