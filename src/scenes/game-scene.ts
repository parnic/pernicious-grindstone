import { CollisionType, Color, Engine, Scene } from "excalibur";
import {EnemyCharacter} from "../actors/enemy";
import { Resources } from "../resource";
import { rand } from "../utilities/math";
import { PlayerCharacter } from "../actors/player";
import { Cell } from "../actors/cell";

export class GameScene extends Scene {
  private _cells: Cell[] = [];
  public get cells() {
    return this._cells;
  }

  private _player?: PlayerCharacter;
  public get player() {
    return this._player;
  }

  onInitialize(engine: Engine): void {
    Resources.tiledmap.addTiledMapToScene(this);
    const objects = Resources.tiledmap.data.getExcaliburObjects();

    const playerStart = objects[0]?.getObjectByName("player_start");
    if (!playerStart) {
      throw Error(`cannot find "player_start" object in tilemap`);
    }

    let cell = new Cell({
      x: playerStart.x + (playerStart.width! / 2),
      y: playerStart.y + (playerStart.width! / 2),
      width: playerStart.width,
      height: playerStart.height,
    });
    engine.add(cell);
    this.cells.push(cell);

    this._player = new PlayerCharacter({
      x: playerStart.x + (playerStart.width! / 2),
      y: playerStart.y + (playerStart.width! / 2),
      width: playerStart.width,
      height: playerStart.height,
      collisionType: CollisionType.Active,
      cell: cell,
    });
    engine.add(this.player!);

    const enemies = objects[0]?.getObjectsByName("enemy");
    if (!enemies) throw Error(`cannot find "enemies".`);
    for (let e of enemies) {
      cell = new Cell({
        x: e.x + (e.width! / 2),
        y: e.y + (e.width! / 2),
        width: e.width,
        height: e.height,
      });
      engine.add(cell);
      this.cells.push(cell);

      const enemy = new EnemyCharacter({
        x: e.x + (e.width! / 2),
        y: e.y + (e.height! / 2),
        width: e.width,
        height: e.height,
        collisionType: CollisionType.Active,
        color: Color.Transparent,
        enemyType: rand.integer(0, 2),
        cell: cell,
      })

      enemy.on('pointerenter', () => {
        enemy.hovered = true;
      });
      enemy.on('pointermove', () => {
        enemy.pointerWasMove = true;
      });
      enemy.on('pointerup', () => {
        // excalibur seems to generate a pointerup event after a click. ignore those.
        enemy.pointerWasMove = false;
        enemy.pointerup();
      })
      enemy.on('pointerleave', () => {
        if (!enemy.pointerWasMove) {
          return;
        }

        enemy.hovered = false;
      })

      engine.add(enemy);
    }

    this.cells.sort((a, b) => {
      if (a.pos.y != b.pos.y) {
        return a.pos.y - b.pos.y;
      }

      return a.pos.x - b.pos.x;
    });
  }
}
