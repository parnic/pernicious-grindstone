import { SpriteSheet } from "excalibur";
import { Resources } from "../resource";

export class ResourceManager {
  static getPlayerSprite() {
    const bodySpriteSheet = SpriteSheet.fromImageSource({
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

    const sprite = bodySpriteSheet.getSprite(5, 1)!;
    sprite.width = 16;
    sprite.height = 16;
    sprite.rotation = Math.PI;
    return sprite;
  }
}