import { Actor, CollisionType, Color, Engine, Scene, Vector } from "excalibur";
import { Resources } from "../resource";

export class GameScene extends Scene {
  onInitialize(engine: Engine): void {
    Resources.tiledmap.addTiledMapToScene(this);
    const objects = Resources.tiledmap.data.getExcaliburObjects();

    const playerStart = objects[0]?.getObjectByName("player_start");
    if (!playerStart) {
      throw Error(`cannot find "player_start" object in tilemap`);
    }

    const actor = new Actor({
      x: playerStart.x,
      y: playerStart.y,
      width: playerStart.width,
      height: playerStart.height,
      color: Color.Magenta,
      collisionType: CollisionType.Active,
    });
    actor.onInitialize = (_engine: Engine): void => {
      // actor.acc = Vector.Down.scale(100);
    };
    engine.add(actor);

    const enemies = objects[0]?.getObjectsByName("spring");
    if (!enemies) throw Error(`cannot find "enemies".`);
    for (let e of enemies) {
      const enemy = new Actor({
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
      })
      engine.add(enemy);
    }
  }
}
