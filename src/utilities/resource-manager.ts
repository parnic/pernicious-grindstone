import { Animation, SpriteSheet } from "excalibur";
import { Resources } from "../resource";

let _spriteSheet: SpriteSheet | undefined;
let _itemsSheet: SpriteSheet | undefined;

export class ResourceManager {
  static _populateSpriteSheet() {
    if (!_spriteSheet) {
      _spriteSheet = SpriteSheet.fromImageSource({
        image: Resources.spritesheet,
        grid: {
          rows: 10,
          columns: 12,
          spriteHeight: 16,
          spriteWidth: 16,
        },
        spacing: {
          margin: {
            x: 0,
            y: 0,
          },
          originOffset: {
            x: 0,
            y: 0,
          },
        },
      });
    }
  }

  static _populateItemsSheet() {
    if (!_itemsSheet) {
      _itemsSheet = SpriteSheet.fromImageSource({
        image: Resources.itemsSpriteSheet,
        grid: {
          rows: 7,
          columns: 14,
          spriteHeight: 64,
          spriteWidth: 64,
        },
        spacing: {
          margin: {
            x: 0,
            y: 0,
          },
          originOffset: {
            x: 0,
            y: 0,
          },
        },
      });
    }
  }

  static getPlayerSprite() {
    this._populateSpriteSheet();

    const sprite = _spriteSheet!.getSprite(2, 0)!;
    sprite.width = 16;
    sprite.height = 16;
    // sprite.rotation = Math.PI;
    return sprite;
  }

  static getClosedExitSprite() {
    this._populateSpriteSheet();

    const sprite = _spriteSheet!.getSprite(6, 2)!;
    sprite.width = 16;
    sprite.height = 16;
    return sprite;
  }

  static getOpenExitSprite() {
    this._populateSpriteSheet();

    const sprite = _spriteSheet!.getSprite(6, 1)!;
    sprite.width = 16;
    sprite.height = 16;
    return sprite;
  }

  static getGemSpriteAnimation(): Animation {
    this._populateItemsSheet();

    return Animation.fromSpriteSheetCoordinates({
      spriteSheet: _itemsSheet!,
      durationPerFrame: 250,
      frameCoordinates: [
        {x: 7, y: 3, options: {width: 16, height: 16}},
        {x: 8, y: 3, options: {width: 16, height: 16}},
        {x: 9, y: 3, options: {width: 16, height: 16}},
        {x: 10, y: 3, options: {width: 16, height: 16}},
      ]
    });
  }
}
