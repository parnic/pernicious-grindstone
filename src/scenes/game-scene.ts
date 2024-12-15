import { ActorEvents, CollisionType, Color, EasingFunctions, Engine, EventEmitter, GameEvent, Logger, Scene, SceneEvents } from "excalibur";
import { EnemyCharacter } from "../actors/enemy";
import { Resources } from "../resource";
import { rand } from "../utilities/math";
import { PlayerCharacter } from "../actors/player";
import { Cell } from "../actors/cell";
import { InsertedTile, TiledObjectLayer, TiledResource } from "@excaliburjs/plugin-tiled";
import { Exit } from "../actors/exit";
import { ObjectLayer } from "@excaliburjs/plugin-tiled/dist/src/resource/object-layer";

type GameSceneEvents = {
  TargetScoreReached: TargetScoreReachedEvent;
}

export class TargetScoreReachedEvent extends GameEvent<number> {
  constructor(public currScore: number) {
    super();
  }
}

export const GameSceneEvents = {
  TargetScoreReached: 'targetscorereached'
} as const;

export class GameScene extends Scene {
  public events = new EventEmitter<SceneEvents & GameSceneEvents>();

  private targetScoreVal: HTMLElement;

  private _cells: Cell[] = [];
  public get cells() {
    return this._cells;
  }

  private _player?: PlayerCharacter;
  public get player() {
    return this._player;
  }

  private _exit?: Exit;
  public get exit() {
    return this._exit;
  }

  private _pointerDown: Boolean = false;
  public get pointerDown(): Boolean {
    return this._pointerDown;
  }

  private _targetScore: number = 50;
  public get targetScore(): number {
    return this._targetScore;
  }

  constructor() {
    super();

    this.targetScoreVal = document.getElementById('targetScore')!;
  }

  onInitialize(engine: Engine): void {
    Resources.tiledmap.addToScene(this);
    const targetScoreProp = Resources.tiledmap.map.properties?.find(p => p.name === "target-score");
    if (!targetScoreProp) {
      Logger.getInstance().warn(`no target-score property found on imported map; will use default value of ${this._targetScore}`);
    } else if (targetScoreProp.type !== 'int') {
      Logger.getInstance().warn(`target-score property on map is not of type int; will use default value of ${this._targetScore}`);
    } else {
      this._targetScore = targetScoreProp.value;
    }
    this.targetScoreVal.textContent = `${this._targetScore}`;

    const objects = Resources.tiledmap.getObjectLayers('obje');
    this.addPlayer(objects[0]);
    this.addEnemies(objects[0]);
    this.addExit(objects[0]);

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
    engine.input.pointers.primary.on('move', evt => {
      for (let c of this.cells) {
        const upperBound = c.pos.y - (c.height / 2);
        const leftBound = c.pos.x - (c.width / 2);
        const lowerBound = c.pos.y + (c.height / 2);
        const rightBound = c.pos.x + (c.width / 2);
        c.hovered = evt.worldPos.x >= leftBound && evt.worldPos.y >= upperBound && evt.worldPos.x <= rightBound && evt.worldPos.y <= lowerBound;

        if (this._pointerDown && !(c.occupant instanceof PlayerCharacter) && c !== this.player?.pathTail) {
          c.pointerdown();
        }
      }
    });
  }

  addPlayer(layer: ObjectLayer) {
    const playerStart = layer.getObjectsByName("player_start")[0] as InsertedTile;
    if (!playerStart) {
      throw Error(`cannot find "player_start" object in tilemap`);
    }

    let cell = this.addCell(playerStart.x, playerStart.y, playerStart.width, playerStart.height);

    this._player = new PlayerCharacter({
      x: playerStart.x + (playerStart.width / 2),
      y: playerStart.y + (playerStart.width / 2),
      width: playerStart.width,
      height: playerStart.height,
      collisionType: CollisionType.PreventCollision,
      cell: cell,
    });
    this.add(this.player!);
  }

  addEnemies(layer: ObjectLayer) {
    const enemies = layer.getObjectsByName("enemy");
    if (!enemies) {
      throw Error(`cannot find "enemy".`);
    }

    for (let e of enemies.map((enemy) => enemy as InsertedTile)) {
      let cell = this.addCell(e.x, e.y, e.width, e.height);
      this.spawnEnemy(cell);
    }
  }

  addExit(layer: ObjectLayer) {
    const exit = layer.getObjectsByName('exit');
    if (!exit || exit.length != 1) {
      throw Error(`cannot find "exit".`);
    }
    const exitTile = exit[0] as InsertedTile;
    if (!exitTile) {
      throw Error(`"exit" tile not of expected type`);
    }

    let cell = this.addCell(exitTile.x, exitTile.y, exitTile.width, exitTile.height);

    this._exit = new Exit({
      x: exitTile.x + (exitTile.width / 2),
      y: exitTile.y + (exitTile.height / 2),
      width: exitTile.width,
      height: exitTile.height,
      cell: cell,
    });
    this.add(this._exit!);
  }

  addCell(x: number, y: number, width: number, height: number): Cell {
    let cell = new Cell({
      x: x + (width / 2),
      y: y + (height / 2),
      width: width,
      height: height,
      color: Color.Transparent,
    });

    cell.on('pointerdown', () => {
      cell.pointerdown();
    });

    this.add(cell);
    this.cells.push(cell);

    return cell;
  }

  private spawnEnemy(c: Cell) {
    const enemy = new EnemyCharacter({
      x: c.pos.x,
      y: -c.height,
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
    enemy.actions.moveTo({pos: c.pos, duration: 600, easing: EasingFunctions.EaseInCubic});
  }

  public refillEnemies() {
    var emptyCells = this.cells.filter(c => !c.occupant).sort((a, b) => a.pos.x - b.pos.x);
    for (let i = 0; i < emptyCells.length;) {
      var numInCol = 1;
      while (i + numInCol < emptyCells.length && emptyCells[i + numInCol].pos.x == emptyCells[i].pos.x) {
        numInCol++;
      }

      const filledCellsInCol = this.cells.filter(
        c => c.occupant instanceof EnemyCharacter && c.pos.x == emptyCells[i].pos.x
      ).sort(
        (a, b) => b.pos.y - a.pos.y
      );
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
    source.occupant!.actions.moveTo({pos: target.pos, duration: 250, easing: EasingFunctions.EaseInCubic})

    let occupant = source.occupant as EnemyCharacter;
    source.occupant = undefined;
    target.occupant = occupant;

    occupant.cell = target;
  }
}
