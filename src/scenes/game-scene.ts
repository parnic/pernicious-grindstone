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

  private _pointerDown: Boolean = false;
  public get pointerDown(): Boolean {
    return this._pointerDown;
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
      collisionType: CollisionType.PreventCollision,
      cell: cell,
    });
    this.add(this.player!);

    const enemies = objects[0]?.getObjectsByName("enemy");
    if (!enemies) throw Error(`cannot find "enemies".`);
    for (let e of enemies.map((enemy) => enemy as InsertedTile)) {
      let cell = this.addCell(engine, e.x, e.y, e.width!, e.height!);
      this.spawnEnemy(cell);
    }

    this.cells.sort((a, b) => {
      if (a.pos.y != b.pos.y) {
        return a.pos.y - b.pos.y;
      }

      return a.pos.x - b.pos.x;
    });

    engine.input.pointers.primary.on('down', () => {
      this._pointerDown = true;
    });
    engine.input.pointers.primary.on('up', () => {
      this._pointerDown = false;
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

      if (this._pointerDown && !(cell.occupant instanceof PlayerCharacter) && cell !== this.player?.pathTail) {
        cell.pointerdown();
      }
    });
    cell.on('pointermove', () => {
      cell.pointerWasMove = true;
    });
    cell.on('pointerdown', () => {
      // excalibur seems to generate a pointerleave event after a click. ignore those.
      cell.pointerWasMove = false;
      cell.pointerdown();
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

  private spawnEnemy(c: Cell) {
    const enemy = new EnemyCharacter({
      x: c.pos.x,
      y: c.pos.y - this.engine.canvasHeight,
      width: c.width,
      height: c.height,
      collisionType: CollisionType.PreventCollision,
      color: Color.Transparent,
      enemyType: rand.integer(0, 2),
      cell: c,
    });

    c.occupant = enemy;

    this.add(enemy);

    // todo: they really should fall in rows to look nicer (filling in from the bottom up).
    // can we do that with a small delay per row? maybe track the number of unique y coordinates we've seen and map them to row number,
    // use that as an input to this?
    enemy.actions.moveTo(c.pos, c.pos.y - enemy.pos.y);
  }

  public refillEnemies() {
    var emptyCells = this.cells.filter(c => !c.occupant).sort((a, b) => a.pos.x - b.pos.x);
    for (let i = 0; i < emptyCells.length;) {
      var numInCol = 1;
      while (i + numInCol < emptyCells.length && emptyCells[i + numInCol].pos.x == emptyCells[i].pos.x) {
        numInCol++;
      }

      const filledCellsInCol = this.cells.filter(c => c.occupant !== undefined && c.pos.x == emptyCells[i].pos.x).sort((a, b) => b.pos.y - a.pos.y);
      for (const cell of filledCellsInCol) {
        if (cell.occupant instanceof PlayerCharacter) {
          continue;
        }

        const targetCell = cell.getFurthestUnoccupiedCellBeneath();
        // occupied cells beneath the empty cell shouldn't try to slide
        if (!targetCell) {
          continue;
        }
        this.slideOccupantToNewCell(cell, targetCell!);
      }

      const topEmptyCells = this.cells.filter(c => !c.occupant && c.pos.x == emptyCells[i].pos.x).sort((a, b) => a.pos.y - b.pos.y);
      for (let j = 0; j < numInCol; j++) {
        this.spawnEnemy(topEmptyCells[numInCol - j - 1]);
      }

      i += numInCol;
    }
  }

  public slideOccupantToNewCell(source: Cell, target: Cell) {
    // todo: pick an appropriate speed. this feels _okay_, but not great.
    // previously, sliding down happened over the same period of time as a new enemy spawning, so one was slow and the other was fast and it looked dumb.
    // i'd like to have them slide down together, but that means coordinating the two somehow.
    source.occupant!.actions.moveTo(target.pos, 300);//target.pos.y - source.pos.y);

    let occupant = source.occupant as EnemyCharacter;
    source.occupant = undefined;
    target.occupant = occupant;

    occupant.cell = target;
  }
}
