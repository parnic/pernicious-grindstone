import { Actor, CollisionType, Color, Engine, Logger, Random, Scene, Vector } from "excalibur";
import {EnemyCharacter} from "../actors/enemy";
import { Resources } from "../resource";
import { rand } from "../utilities/math";

export class GameScene extends Scene {
  onInitialize(engine: Engine): void {
    Resources.tiledmap.addTiledMapToScene(this);
    const objects = Resources.tiledmap.data.getExcaliburObjects();

    const playerStart = objects[0]?.getObjectByName("player_start");
    if (!playerStart) {
      throw Error(`cannot find "player_start" object in tilemap`);
    }

    const actor = new Actor({
      x: playerStart.x + (playerStart.width! / 2),
      y: playerStart.y + (playerStart.width! / 2),
      width: playerStart.width,
      height: playerStart.height,
      color: Color.Magenta,
      collisionType: CollisionType.Active,
    });
    actor.onInitialize = (_engine: Engine): void => {
      // actor.acc = Vector.Down.scale(100);
    };
    engine.add(actor);

    const enemies = objects[0]?.getObjectsByName("enemy");
    if (!enemies) throw Error(`cannot find "enemies".`);
    for (let e of enemies) {
      const enemy = new EnemyCharacter({
        x: e.x + (e.width! / 2),
        y: e.y + (e.height! / 2),
        width: e.width,
        height: e.height,
        collisionType: CollisionType.Active,
        color: Color.Transparent,
        enemyType: rand.integer(0, 2),
      })
      enemy.on('pointerenter', () => {
        enemy.color = enemy.enemyType == 0 ? Color.Red : enemy.enemyType == 1 ? Color.Green : Color.Blue;
      });
      enemy.on('pointerleave', () => {
        enemy.color = Color.Transparent;
      });
      engine.add(enemy);
    }
  }
}
