import { CollisionType, Color, EasingFunctions, Engine, EventEmitter, GameEvent, Logger, Scene, SceneEvents } from "excalibur";
import { EnemyCharacter } from "../actors/enemy";
import { rand } from "../utilities/math";
import { PlayerCharacter, PlayerEvents, TurnEndedEvent } from "../actors/player";
import { Cell } from "../actors/cell";
import { InsertedTile, TiledResource } from "@excaliburjs/plugin-tiled";
import { Exit } from "../actors/exit";
import { ObjectLayer } from "@excaliburjs/plugin-tiled/dist/src/resource/object-layer";
import { html } from "../utilities/html";
import { SceneManager } from "../scene-manager";

type GameSceneEvents = {
  TargetScoreReached: TargetScoreReachedEvent;
  ExitReached: ExitReachedEvent;
  CompleteStage: CompleteStageEvent;
}

export class TargetScoreReachedEvent extends GameEvent<number> {
  constructor(public currScore: number) {
    super();
  }
}

export class ExitReachedEvent extends GameEvent<void> {
  constructor() {
    super();
  }
}

export class CompleteStageEvent extends GameEvent<void> {
  constructor() {
    super();
  }
}

export const GameSceneEvents = {
  TargetScoreReached: 'targetscorereached',
  ExitReached: 'exitreached',
  CompleteStage: 'completestage',
} as const;

export class GameScene extends Scene {
  public events = new EventEmitter<SceneEvents & GameSceneEvents>();

  private targetScoreVal: HTMLElement;
  private clearElement: HTMLElement;
  private healthDepletedElement: HTMLElement;
  private btnRestart: HTMLElement;

  private readonly _enemyRefillDurationMs = 600;
  public get enemyRefillDurationMs() {
    return this._enemyRefillDurationMs;
  }

  private _map: TiledResource;

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

  private readonly _enragedMaxPerTurn: number = 3;
  private readonly _enragedThreatIncreaseTurnsMinor = 2;
  private readonly _enragedThreatIncreaseTurnsMajor = 4;
  private readonly _enragedChanceMinIncrease: number = 0.1;
  private readonly _enragedChanceMaxIncrease: number = 0.2;
  private _numToEnrageMin: number = 0;
  private _numToEnrageMax: number = 0;
  private _enragedChanceMin: number = 0;
  private _enragedChanceMax: number = 0;
  private _turn: number = 1;

  private _enemyCounter: number = 0;

  constructor(map: TiledResource) {
    super();

    this.targetScoreVal = document.getElementById('targetScore')!;
    this.clearElement = document.getElementById('clearElement')!;
    this.healthDepletedElement = document.getElementById('healthDepletedElement')!;
    this.btnRestart = document.getElementById('btnRestart')!;

    this._map = map;
  }

  onInitialize(engine: Engine): void {
    this._map.addToScene(this);
    const targetScoreProp = this._map.map.properties?.find(p => p.name === "target-score");
    if (!targetScoreProp) {
      Logger.getInstance().warn(`no target-score property found on imported map; will use default value of ${this._targetScore}`);
    } else if (targetScoreProp.type !== 'int') {
      Logger.getInstance().warn(`target-score property on map is not of type int; will use default value of ${this._targetScore}`);
    } else {
      this._targetScore = targetScoreProp.value;
    }
    this.targetScoreVal.textContent = `${this._targetScore}`;

    html.hideElement(this.clearElement);
    html.hideElement(this.healthDepletedElement);

    const objects = this._map.getObjectLayers('obje');
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
      if (!this.player || this.player.isDead) {
        return;
      }

      for (let c of this.cells) {
        // rectangular hover
        // const upperBound = c.pos.y - (c.height / 2);
        // const leftBound = c.pos.x - (c.width / 2);
        // const lowerBound = c.pos.y + (c.height / 2);
        // const rightBound = c.pos.x + (c.width / 2);
        // c.hovered = evt.worldPos.x >= leftBound && evt.worldPos.y >= upperBound && evt.worldPos.x <= rightBound && evt.worldPos.y <= lowerBound;

        // circular hover
        const lenSq = evt.worldPos.squareDistance(c.pos);
        const requiredDist = Math.pow(c.width / 2, 2);
        c.hovered = lenSq <= requiredDist;

        if (this._pointerDown && !(c.occupant instanceof PlayerCharacter) && c !== this.player?.pathTail) {
          c.pointerdown();
        }
      }
    });

    this.events.on(GameSceneEvents.ExitReached, () => {
      html.showElement(this.clearElement);
    });

    this.events.on(GameSceneEvents.CompleteStage, () => {
      SceneManager.goToNextScene(this.engine);
    });

    this.btnRestart.addEventListener('click', () => {
      SceneManager.goToScene(SceneManager.getFirstSceneData(), this.engine, SceneManager.getCurrentSceneData(this.engine));
    });
  }

  addPlayer(layer: ObjectLayer) {
    const playerStart = layer.getObjectsByName("player_start")[0] as InsertedTile;
    if (!playerStart) {
      throw Error(`cannot find "player_start" object in tilemap`);
    }

    let cell = this.addCell(playerStart.x, playerStart.y, playerStart.width, playerStart.height);

    this._player = new PlayerCharacter({
      name: `player`,
      x: playerStart.x + (playerStart.width / 2),
      y: playerStart.y + (playerStart.width / 2),
      width: playerStart.width,
      height: playerStart.height,
      collisionType: CollisionType.PreventCollision,
      cell: cell,
    });
    this.add(this.player!);

    this._player!.events.on(PlayerEvents.HealthDepleted, () => {
      html.unhideElement(this.healthDepletedElement);

      for (let c of this.cells) {
        c.hovered = false;
      }
    });

    this._player!.events.on(PlayerEvents.TurnEnded, evt => {
      const neighbors = this._player!.cell.getOrthogonalNeighbors();
      const enragedCells = neighbors.filter(c => c.occupant instanceof EnemyCharacter && (c.occupant as EnemyCharacter).enraged);
      (evt as TurnEndedEvent).numAttacks += enragedCells.length;
    })

    this._player!.events.on(PlayerEvents.NextTurnStarted, () => {
      this._turn++;

      if (this._turn % this._enragedThreatIncreaseTurnsMinor === 0) {
        this._enragedChanceMin = Math.min(this._enragedChanceMin + this._enragedChanceMinIncrease, 1.0);
        this._enragedChanceMax = Math.min(this._enragedChanceMax + this._enragedChanceMaxIncrease, 1.0);

        if (this._turn % this._enragedThreatIncreaseTurnsMajor === 0) {
          this._numToEnrageMin = Math.min(this._numToEnrageMin + 1, this._enragedMaxPerTurn);
        }
        this._numToEnrageMax = Math.min(this._numToEnrageMax + 1, this._enragedMaxPerTurn);
      }

      let availableEnemies = this.cells.filter(c => c.occupant instanceof EnemyCharacter && !(c.occupant as EnemyCharacter).enraged).map(c => c.occupant as EnemyCharacter);

      const numToEnrage = rand.integer(this._numToEnrageMin, this._numToEnrageMax);
      Logger.getInstance().info(`Turn ${this._turn} started. Enraged chance: [${this._enragedChanceMin},${this._enragedChanceMax}], # to enrage: [${this._numToEnrageMin},${this._numToEnrageMax}] -> picked ${numToEnrage}`);

      for (let i = 0; i < numToEnrage; i++) {
        const enrageChanceThreshold = rand.floating(this._enragedChanceMin, this._enragedChanceMax);
        const enrageChance = rand.next();
        Logger.getInstance().info(`..enraged attempt #${i + 1}: ${enrageChanceThreshold}, rolled ${enrageChance} -> ${(enrageChance <= enrageChanceThreshold ? 'enraging!' : 'staying calm')}`);

        if (enrageChance <= enrageChanceThreshold) {
          if (availableEnemies.length === 0) {
            Logger.getInstance().info(`....nobody left to enrage`);
            break;
          }

          const toEnrageIdx = rand.integer(0, availableEnemies.length - 1);
          availableEnemies[toEnrageIdx].enraged = true;
          Logger.getInstance().info(`....chose enemy with id ${availableEnemies[toEnrageIdx].id} to enrage`);
          availableEnemies.splice(toEnrageIdx, 1);
        }
      }
    });
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
      name: `exit`,
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
      name: `cell-${x}-${y}`,
      x: x + (width / 2),
      y: y + (height / 2),
      width: width,
      height: height,
      color: Color.Transparent,
      collisionType: CollisionType.PreventCollision,
    });

    cell.on('pointerdown', () => {
      cell.pointerdown();
    });

    this.add(cell);
    this.cells.push(cell);

    return cell;
  }

  private spawnEnemy(c: Cell) {
    this._enemyCounter++;

    const enemy = new EnemyCharacter({
      name: `enemy-${this._enemyCounter}`,
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
    enemy.actions.moveTo({pos: c.pos, duration: this.enemyRefillDurationMs, easing: EasingFunctions.EaseInCubic});
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
    const moveDuration = 250;

    // todo: pick an appropriate speed. this feels _okay_, but not great.
    // previously, sliding down happened over the same period of time as a new enemy spawning, so one was slow and the other was fast and it looked dumb.
    // i'd like to have them slide down together, but that means coordinating the two somehow.
    source.occupant!.actions.moveTo({pos: target.pos, duration: moveDuration, easing: EasingFunctions.EaseInCubic})

    let occupant = source.occupant as EnemyCharacter;
    source.occupant = undefined;
    target.occupant = occupant;

    occupant.cell = target;
  }
}
