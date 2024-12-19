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

import imagePlayerBody from '../img/player/body.png'
import imagePlayerFaceAnnoyed from '../img/player/face-annoyed.png'
import imagePlayerFaceGoofy from '../img/player/face-goofy.png'
import imagePlayerFaceHappy1 from '../img/player/face-happy1.png'
import imagePlayerFaceHappy1N from '../img/player/face-happy1-n.png'
import imagePlayerFaceHappy1NW from '../img/player/face-happy1-nw.png'
import imagePlayerFaceHappy1W from '../img/player/face-happy1-w.png'
import imagePlayerFaceHappy1SW from '../img/player/face-happy1-sw.png'
import imagePlayerFaceHappy1S from '../img/player/face-happy1-s.png'
import imagePlayerFaceHappy1SE from '../img/player/face-happy1-se.png'
import imagePlayerFaceHappy1E from '../img/player/face-happy1-e.png'
import imagePlayerFaceHappy1NE from '../img/player/face-happy1-ne.png'
import imagePlayerFaceHappy2 from '../img/player/face-happy2.png'
import imagePlayerFaceMiffed from '../img/player/face-miffed.png'
import imagePlayerFaceMischievous from '../img/player/face-mischievous.png'
import imagePlayerFaceRelieved from '../img/player/face-relieved.png'
import imagePlayerFaceWorried from '../img/player/face-worried.png'

import stage01Path from '../res/stage-01.tmx';
import stage02Path from '../res/stage-02.tmx';
import stage03Path from '../res/stage-03.tmx';
import spriteSheet from '../img/kenney-pixel-shmup/tiles_packed.png';
import itemsSpriteSheet from '../img/platformPack_tilesheet.png'
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

import enemyEnragedSfx01 from '../sound/sfx/enrage/enrage01.wav'
import enemyEnragedSfx02 from '../sound/sfx/enrage/enrage02.wav'
import enemyEnragedSfx03 from '../sound/sfx/enrage/enrage03.wav'
import enemyEnragedSfx04 from '../sound/sfx/enrage/enrage04.wav'
import enemyEnragedSfx05 from '../sound/sfx/enrage/enrage05.wav'
import enemyEnragedSfx06 from '../sound/sfx/enrage/enrage06.wav'
import enemyEnragedSfx07 from '../sound/sfx/enrage/enrage07.wav'
import enemyEnragedSfx08 from '../sound/sfx/enrage/enrage08.wav'
import enemyEnragedSfx09 from '../sound/sfx/enrage/enrage09.wav'
import enemyEnragedSfx10 from '../sound/sfx/enrage/enrage10.wav'

import enemyImpactSfx01 from '../sound/sfx/impacts/HKAP2 Seq2.13 Hit 1a.wav'
import enemyImpactSfx02 from '../sound/sfx/impacts/HKAP2 Seq2.13 Hit 1b.wav'
import enemyImpactSfx03 from '../sound/sfx/impacts/HKAP2 Seq2.13 Hit 1c.wav'
import enemyImpactSfx04 from '../sound/sfx/impacts/Seq 2.1 Hit 1 96 HK1.wav'
import enemyImpactSfx05 from '../sound/sfx/impacts/Seq 2.1 Hit 2 96 HK1.wav'
import enemyImpactSfx06 from '../sound/sfx/impacts/Seq 2.1 Hit 3 96 HK1.wav'
import enemyImpactSfx07 from '../sound/sfx/impacts/Seq 2.27 Hit 1 96 HK1.wav'
import enemyImpactSfx08 from '../sound/sfx/impacts/Seq1.15 Hit 1 96 HK1.wav'
import enemyImpactSfx09 from '../sound/sfx/impacts/Seq1.15 Hit 3 96 HK1.wav'

import exitOpenSfx01 from '../sound/sfx/exit-open/zapsplat_multimedia_game_sound_door_open_magical_unlock_level_secret_001_73548.mp3'

import bgm01 from '../sound/music/chip-mode-danijel-zambo-main-version-1431-02-05.mp3'
import bgm02 from '../sound/music/game-over-danijel-zambo-main-version-1394-02-03.mp3'
import bgm03 from '../sound/music/itty-bitty-8-bit-kevin-macleod-main-version-7983-03-13.mp3'
import { Constants } from "./utilities/constants";

export const Resources = {
  stage01: new TiledResource(stage01Path, {
    startZIndex: Constants.BackgroundZIndex,
    pathMap: [
      { path: 'tiles_packed.png', output: spriteSheet },
      { path: 'kenney-pixel-shmup.tsx', output: tsxPath }
    ]
  }),
  stage02: new TiledResource(stage02Path, {
    startZIndex: Constants.BackgroundZIndex,
    pathMap: [
      { path: 'tiles_packed.png', output: spriteSheet },
      { path: 'kenney-pixel-shmup.tsx', output: tsxPath }
    ]
  }),
  stage03: new TiledResource(stage03Path, {
    startZIndex: Constants.BackgroundZIndex,
    pathMap: [
      { path: 'tiles_packed.png', output: spriteSheet },
      { path: 'kenney-pixel-shmup.tsx', output: tsxPath }
    ]
  }),
  spritesheet: new ImageSource(spriteSheet),
  itemsSpriteSheet: new ImageSource(itemsSpriteSheet),
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
  },
  player: {
    body: new ImageSource(imagePlayerBody),
    faceAnnoyed: new ImageSource(imagePlayerFaceAnnoyed),
    faceGoofy: new ImageSource(imagePlayerFaceGoofy),
    faceHappy1: new ImageSource(imagePlayerFaceHappy1),
    faceHappy1N: new ImageSource(imagePlayerFaceHappy1N),
    faceHappy1NW: new ImageSource(imagePlayerFaceHappy1NW),
    faceHappy1W: new ImageSource(imagePlayerFaceHappy1W),
    faceHappy1SW: new ImageSource(imagePlayerFaceHappy1SW),
    faceHappy1S: new ImageSource(imagePlayerFaceHappy1S),
    faceHappy1SE: new ImageSource(imagePlayerFaceHappy1SE),
    faceHappy1E: new ImageSource(imagePlayerFaceHappy1E),
    faceHappy1NE: new ImageSource(imagePlayerFaceHappy1NE),
    faceHappy2: new ImageSource(imagePlayerFaceHappy2),
    faceMiffed: new ImageSource(imagePlayerFaceMiffed),
    faceMischievous: new ImageSource(imagePlayerFaceMischievous),
    faceRelieved: new ImageSource(imagePlayerFaceRelieved),
    faceWorried: new ImageSource(imagePlayerFaceWorried),
  },
}

export const SfxResources = {
  impacts: [
    new Sound(impactSfx01),
    new Sound(impactSfx02),
    new Sound(impactSfx03),
    new Sound(impactSfx04),
  ],
  enemyImpacts: [
    new Sound(enemyImpactSfx01),
    new Sound(enemyImpactSfx02),
    new Sound(enemyImpactSfx03),
    new Sound(enemyImpactSfx04),
    new Sound(enemyImpactSfx05),
    new Sound(enemyImpactSfx06),
    new Sound(enemyImpactSfx07),
    new Sound(enemyImpactSfx08),
    new Sound(enemyImpactSfx09),
  ],
  exitOpen: [
    new Sound(exitOpenSfx01),
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
  enemyEnraged: [
    new Sound(enemyEnragedSfx01),
    new Sound(enemyEnragedSfx02),
    new Sound(enemyEnragedSfx03),
    new Sound(enemyEnragedSfx04),
    new Sound(enemyEnragedSfx05),
    new Sound(enemyEnragedSfx06),
    new Sound(enemyEnragedSfx07),
    new Sound(enemyEnragedSfx08),
    new Sound(enemyEnragedSfx09),
    new Sound(enemyEnragedSfx10),
  ],
  bgm: [
    new Sound(bgm01),
    new Sound(bgm02),
    new Sound(bgm03),
  ],
}
