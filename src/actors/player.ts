import { Actor, ActorArgs, ActorEvents, CollisionType, Color, EasingFunctions, ElasticToActorStrategy, Engine, EventEmitter, GameEvent, Keys, Line, Logger, Vector } from "excalibur";
import { ResourceManager } from "../utilities/resource-manager";
import { Cell, CellOccupant } from "./cell";
import { GameScene, GameSceneEvents, TargetScoreReachedEvent } from "../scenes/game-scene";
import { EnemyCharacter, isHoverable } from "./enemy";
import { rand } from "../utilities/math";
import { Exit } from "./exit";
import { html } from "../utilities/html";
import { Audio } from "../utilities/audio";

type PlayerEvents = {
    HealthDepleted: HealthDepletedEvent;
    TurnEnded: TurnEndedEvent;
    NextTurnStarted: NextTurnStartedEvent;
}

export class HealthDepletedEvent extends GameEvent<void> {
    constructor() {
        super();
    }
}

export class NextTurnStartedEvent extends GameEvent<void> { }

export class TurnEndedEvent extends GameEvent<void> {
    numAttacks: number = 0;
}

export const PlayerEvents = {
    HealthDepleted: 'healthdepleted',
    TurnEnded: 'turnended',
    NextTurnStarted: 'nextturnstarted',
} as const;

export type PlayerCharacterArgs = ActorArgs & {
    cell: Cell;
}

export class PlayerCharacter extends Actor implements CellOccupant {
    public events = new EventEmitter<ActorEvents & PlayerEvents>();

    private willScoreRoot: HTMLElement;
    private willScoreVal: HTMLElement;
    private scoreRoot: HTMLElement;
    private scoreVal: HTMLElement;
    private goButton: HTMLElement;
    private targetScoreGroup: HTMLElement;
    private scoreTextGroup: HTMLElement;
    private playerHealthIndicator: HTMLElement;

    private _score: number = 0;
    public get score() {
        return this._score;
    }

    private _going: boolean = false;
    public get going() {
        return this._going;
    }
    public set going(inGoing: boolean) {
        this._going = inGoing;
        if (this.going) {
            this.gameScene.cells.forEach(c => c.hovered = false);
        }
    }

    private _cell: Cell;
    public get cell() {
        return this._cell;
    }

    public get gameScene() {
        return this.scene as GameScene;
    }

    private _path: Cell[] = [];
    public get path(): Cell[] {
        return this._path;
    }

    private _pathLines: Actor[] = [];

    private _healthMax: number = 3;
    public get healthMax(): number {
        return this._healthMax;
    }

    private _health: number = 0;
    public get health(): number {
        return this._health;
    }
    private set health(inHealth: number) {
        if (inHealth < 0) {
            inHealth = 0;
        }

        if (this.health == inHealth) {
            return;
        }

        this._health = inHealth;
        this.updateHealthUi();

        if (this.isDead) {
            this.events.emit(PlayerEvents.HealthDepleted);
        }
    }

    public get isDead(): boolean {
        return this.health == 0;
    }

    constructor(config?: PlayerCharacterArgs) {
        super(config);

        this.z = 20;

        this._cell = config?.cell!;
        this._cell.occupant = this;

        this._health = this.healthMax;

        this.willScoreRoot = document.getElementById('pathElement')!;
        this.willScoreVal = document.getElementById('pathScore')!;
        this.scoreRoot = document.getElementById('playerInfoElement')!;
        this.scoreVal = document.getElementById('score')!;
        this.goButton = document.getElementById('btnGo')!;
        this.targetScoreGroup = document.getElementById('targetScoreGroup')!;
        this.scoreTextGroup = document.getElementById('scoreText')!;
        this.playerHealthIndicator = document.getElementById('playerHealthIndicator')!;
    }

    canHover(pathTail: Cell): boolean {
        return false;
    }

    private _goClickHandler = () => this.go();

    onAdd(engine: Engine): void {
        this.goButton.addEventListener('click', this._goClickHandler);
    }

    onRemove(engine: Engine): void {
        this.goButton.removeEventListener('click', this._goClickHandler)
    }

    public onInitialize(_engine: Engine): void {
        this.graphics.use(ResourceManager.getPlayerSprite());

        html.unhideElement(this.goButton);

        html.unhideElement(this.scoreRoot);

        _engine.input.keyboard.on('release', evt => {
            if (evt.key == Keys.Space) {
                this.go();
            }
        });

        this.updateScoreUi();
        this.updateHealthUi();
    }

    public onPostUpdate(_engine: Engine, _delta: number): void {
        if (this._pathLines.length === this.path.length) {
            return;
        }

        // if the path is longer than the list of lines, add new line(s)
        for (let i = this._pathLines.length; i < this.path.length; i++) {
            let source = this.cell;
            if (i > 0) {
                source = this.path[i - 1];
            }

            let lineActor = new Actor({
                name: `player-pathlinesegment-${i + 1}`,
                x: source.pos.x,
                y: source.pos.y,
                z: 25,
                collisionType: CollisionType.PreventCollision,
            });
            lineActor.graphics.anchor = Vector.Zero;
            lineActor.graphics.use(new Line({
                start: Vector.Zero,
                end: this.path[i].pos.sub(source.pos),
            }));
            _engine.add(lineActor);
            this._pathLines.push(lineActor);
        }

        // if we have more lines than actors in the path, delete old line(s)
        for (let i = this._pathLines.length; i > this.path.length; i--) {
            this._pathLines[i - 1].kill();
            this._pathLines.pop();
        }
    }

    public select(enemy?: EnemyCharacter) {
        if (enemy instanceof PlayerCharacter) {
            for (let c of this.path) {
                if (isHoverable(c.occupant)) {
                    c.occupant.pointerdown();
                }
            }

            this.path.length = 0;
            Audio.playSelectedSfx(this.path.length);
            this.updateScoreUi();
            return;
        }

        let selectedIdx = this.path.findIndex((c) => c == enemy!.cell);
        if (selectedIdx >= 0) {
            // if we select someone further back in the path, reset the path to that person
            // rather than deselecting everyone starting at them and going to the end.
            // this also catches the case of selected the final/only person in the path.
            if (selectedIdx < this.path.length - 1) {
                selectedIdx++;
            }

            const removed = this.path.splice(selectedIdx);
            for (let c of removed) {
                if (isHoverable(c.occupant)) {
                    c.occupant.pointerdown();
                }
            }
            this.updateScoreUi();
            Audio.playSelectedSfx(this.path.length);
            return;
        }

        this.path.push(enemy!.cell);
        enemy!.pointerdown();

        this.updateScoreUi();
        Audio.playSelectedSfx(this.path.length);
    }

    private updateScoreUi() {
        if (this.path.length === 0) {
            html.hideElement(this.willScoreRoot);
            this.goButton.setAttribute("disabled", "true");
        } else {
            html.showElement(this.willScoreRoot);
            this.goButton.removeAttribute("disabled");
        }
        this.willScoreVal.textContent = `${this.path.length}`;

        this.scoreVal.textContent = `${this._score}`;
        if (this._score >= this.gameScene.targetScore) {
            html.hideElement(this.targetScoreGroup);
            this.scoreTextGroup.classList.add('gold-shadow');
        } else {
            html.unhideElement(this.targetScoreGroup);
            this.scoreTextGroup.classList.remove('gold-shadow');
        }
    }

    private updateHealthUi() {
        let healthString = "";
        for (let i = 0; i < this.health; i++) {
            healthString += "❤️";
        }
        for (let i = this.health; i < this.healthMax; i++) {
            healthString += "🩶";
        }

        this.playerHealthIndicator.textContent = healthString;
    }

    public get pathTail(): Cell {
        if (this.path.length > 0) {
            return this.path[this.path.length - 1];
        }

        return this.cell;
    }

    private addScore(points: number = 1) {
        const prevScore = this._score;
        this._score += points;
        this.updateScoreUi();

        if (this._score >= this.gameScene.targetScore && prevScore < this.gameScene.targetScore) {
            this.gameScene.events.emit(GameSceneEvents.TargetScoreReached, new TargetScoreReachedEvent(this._score));
            Audio.playExitOpenedSfx();
        }
    }

    public go(): void {
        if (this.going || this.path.length === 0) {
            return;
        }

        this.going = true;

        const moveDurationMax = 200;
        const moveDurationMin = 60;
        const delayMin = 50;

        let moveDuration = moveDurationMax;
        let delay = 150;

        const camStrategy = new ElasticToActorStrategy(this, 0.1, 0.9);
        const origCamPos = this.scene!.camera.pos;

        const killedEnemies = this.path.filter(p => p.occupant instanceof EnemyCharacter).map(p => p.occupant as EnemyCharacter);

        let moveChain = this.actions.delay(1);
        for (let idx = 0; idx < this.path.length; idx++) {
            const killIdx = idx;
            moveChain = moveChain.delay(delay);
            moveChain = moveChain.moveTo({ pos: this.path[idx].pos, duration: moveDuration, easing: EasingFunctions.EaseInCubic });
            if (this.path[killIdx].occupant instanceof EnemyCharacter) {
                moveChain = moveChain.callMethod(() => this.path[killIdx].occupant?.kill());
            }
            moveChain = moveChain.callMethod(() => this.addScore(1));
            if (killIdx === 9) {
                moveChain = moveChain.callMethod(() => this.scene!.camera.addStrategy(camStrategy));
            }
            if (killIdx > 0 && killIdx % 9 === 0) {
                const adder = killIdx / 900;
                moveChain = moveChain.callMethod(() => this.scene!.camera.zoomOverTime(1.05 + adder, 500, EasingFunctions.EaseInOutCubic));
            }

            const shakeScaler = Math.trunc(idx / 3);
            const shakeXMin = Math.max(1, Math.min(3, shakeScaler));
            const shakeXMax = Math.max(1, Math.min(5, shakeScaler + 2));
            moveChain = moveChain.callMethod(() => this.scene!.camera.shake(rand.integer(shakeXMin, shakeXMax), rand.integer(0, 2), delay));

            delay = Math.max(delayMin, delay * 0.85);
            moveDuration = Math.max(moveDurationMin, moveDuration * 0.9);
        }

        if (this.pathTail.occupant instanceof Exit) {
            this.actions
                .callMethod(() => this.gameScene.events.emit(GameSceneEvents.ExitReached))
                .delay(3000)
                .callMethod(() => this.gameScene.events.emit(GameSceneEvents.CompleteStage));
        } else {
            const turnEndedPromise = moveChain.callMethod(() => {
                // todo: if our final cell is the exit, play the exit fanfare and move on.
                this._cell.occupant = undefined;
                this._cell = this.path[this.path.length - 1];
                this._cell.occupant = this;
                this.path.length = 0;
                this.updateScoreUi();
            }).delay(
                1000
            ).toPromise();

            turnEndedPromise.then(() => {
                const t = new TurnEndedEvent();
                this.events.emit(PlayerEvents.TurnEnded, t);

                let moveChain = this.actions.delay(0);
                if (t.numAttacks > 0) {
                    this.health -= t.numAttacks;
                    Audio.playImpactSfx();
                    if (this.health > 0) {
                        // todo: this isn't working. find a damage effect that looks good.
                        moveChain = moveChain.repeat(ctx => {
                            ctx.flash(Color.White, 50).delay(50);
                        }, 4);
                    }
                }

                if (this.health === 0) {
                    return;
                }

                moveChain = moveChain.callMethod(() => {
                    this.scene!.camera.removeStrategy(camStrategy);
                    this.scene!.camera.move(origCamPos, 250, EasingFunctions.EaseInOutCubic);
                    this.scene!.camera.zoomOverTime(1, 250, EasingFunctions.EaseInOutCubic);
    
                    this.gameScene.refillEnemies();
                    killedEnemies.forEach(e => e.updateNeighborSelected());
                    this.going = false;
                }).delay(
                    this.gameScene.enemyRefillDurationMs
                ).callMethod(() => {
                    this.events.emit(PlayerEvents.NextTurnStarted);
                });
            });
        }
    }
}
