import { CollisionType, Color, Engine, Scene } from "excalibur";
import { EnemyCharacter } from "../actors/enemy";
import { Resources } from "../resource";
import { rand } from "../utilities/math";
import { PlayerCharacter } from "../actors/player";
import { Cell } from "../actors/cell";
import { InsertedTile } from "@excaliburjs/plugin-tiled";

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
    Resources.tiledmap.addToScene(this);
    const objects = Resources.tiledmap.getObjectLayers('obje');

    const playerStart = objects[0]?.getObjectsByName("player_start")[0] as InsertedTile;
    if (!playerStart) {
      throw Error(`cannot find "player_start" object in tilemap`);
    }

    let cell = this.addCell(engine, playerStart.x, playerStart.y, playerStart.width!, playerStart.height!);

    this._player = new PlayerCharacter({
      x: playerStart.x + (playerStart.width! / 2),
      y: playerStart.y + (playerStart.width! / 2),
      width: playerStart.width,
      height: playerStart.height,
      collisionType: CollisionType.Active,
      cell: cell,
    });
    this.add(this.player!);

    const enemies = objects[0]?.getObjectsByName("enemy");
    if (!enemies) throw Error(`cannot find "enemies".`);
    for (let e of enemies.map((enemy) => enemy as InsertedTile)) {
      let cell = this.addCell(engine, e.x, e.y, e.width!, e.height!);

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

      this.add(enemy);
    }

    this.cells.sort((a, b) => {
      if (a.pos.y != b.pos.y) {
        return a.pos.y - b.pos.y;
      }

      return a.pos.x - b.pos.x;
    });
  }

  addCell(engine: Engine, x: number, y: number, width: number, height: number): Cell {
    let cell = new Cell({
      x: x + (width / 2),
      y: y + (height / 2),
      width: width,
      height: height,
      color: Color.Transparent,
    });
    cell.on('pointerenter', () => {
      cell.hovered = true;
    });
    cell.on('pointermove', () => {
      cell.pointerWasMove = true;
    });
    cell.on('pointerup', () => {
      // excalibur seems to generate a pointerup event after a click. ignore those.
      cell.pointerWasMove = false;
      cell.pointerup();
    });
    cell.on('pointerleave', () => {
      if (!cell.pointerWasMove) {
        return;
      }

      cell.hovered = false;
    });
    this.add(cell);
    this.cells.push(cell);

    return cell;
  }
}
