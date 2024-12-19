import { ActionContext, Actor, ActorArgs, ActorEvents, CollisionType, Color, EasingFunctions, ElasticToActorStrategy, Engine, EventEmitter, GameEvent, Keys, Line, Logger, toRadians, vec, Vector } from "excalibur";
import { Cell, CellOccupant } from "./cell";
import { GameScene, GameSceneEvents, TargetScoreReachedEvent } from "../scenes/game-scene";
import { EnemyCharacter, isHoverable } from "./enemy";
import { rand } from "../utilities/math";
import { Exit } from "./exit";
import { html } from "../utilities/html";
import { Audio } from "../utilities/audio";
import { ChainExtender } from "./chain-extender";
import { Constants } from "../utilities/constants";
import { ImageResources } from "../resource";

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

export class TurnEndedEvent extends GameEvent<number> {
    numAttacks: number = 0;

    constructor(public pathLength: number) {
        super();
    }
}

export const PlayerEvents = {
    HealthDepleted: 'healthdepleted',
    TurnEnded: 'turnended',
    NextTurnStarted: 'nextturnstarted',
} as const;

export type PlayerCharacterArgs = ActorArgs & {
    cell: Cell;
}

enum PlayerFaces {
    Happy1 = 'happy1',
    Happy1N = 'happy1-n',
    Happy1NW = 'happy1-nw',
    Happy1W = 'happy1-w',
    Happy1SW = 'happy1-sw',
    Happy1S = 'happy1-s',
    Happy1SE = 'happy1-se',
    Happy1E = 'happy1-e',
    Happy1NE = 'happy1-ne',
    Happy2 = 'happy2',
    Worried = 'worried',
    Mischievous = 'mischievous',
    Annoyed = 'annoyed',
    Relieved = 'relieved',
    Goofy = 'goofy',
    Miffed = 'miffed',
}

export class PlayerCharacter extends Actor implements CellOccupant {
    public events = new EventEmitter<ActorEvents & PlayerEvents>();

    private willScoreRoot: HTMLElement;
    private willScoreVal: HTMLElement;
    private scoreRoot: HTMLElement;
    private scoreVal: HTMLElement;
    private uiRoot: HTMLElement;
    private goButton: HTMLElement;
    private targetScoreGroup: HTMLElement;
    private scoreTextGroup: HTMLElement;
    private playerHealthIndicator: HTMLElement;

    private _faceActor: Actor;
    private _usingFace: string = '';

    private animDeltaMs: number = 0;
    private lastAnimTick: number = 0;
    private animFrame: number = 0;

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

        this.z = Constants.PlayerZIndex;

        this._faceActor = new Actor({
            name: `player-face`,
            x: 0,
            y: 0,
            z: Constants.PlayerCosmeticsZIndex,
            width: this.width,
            height: this.height,
            collisionType: CollisionType.PreventCollision,
        });
        this.addChild(this._faceActor);

        this._cell = config?.cell!;
        this._cell.occupant = this;

        this._health = this.healthMax;

        this.willScoreRoot = document.getElementById('pathElement')!;
        this.willScoreVal = document.getElementById('pathScore')!;
        this.scoreRoot = document.getElementById('playerInfoElement')!;
        this.scoreVal = document.getElementById('score')!;
        this.uiRoot = document.getElementById('uiRoot')!;
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
        this.initializeGraphics();

        html.unhideElement(this.uiRoot);

        html.unhideElement(this.scoreRoot);

        _engine.input.keyboard.on('release', evt => {
            if (evt.key == Keys.Space) {
                this.go();
            }
        });

        this.updateScoreUi();
        this.updateHealthUi();
    }

    private initializeGraphics() {
        const bodySprite = ImageResources.player.body.toSprite();
        bodySprite.width = this.width;
        bodySprite.height = this.height;
        this.graphics.use(bodySprite);

        let faceSprite = ImageResources.player.faceHappy1.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Happy1, faceSprite);

        faceSprite = ImageResources.player.faceHappy1N.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Happy1N, faceSprite);
        faceSprite = ImageResources.player.faceHappy1NW.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Happy1NW, faceSprite);
        faceSprite = ImageResources.player.faceHappy1W.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Happy1W, faceSprite);
        faceSprite = ImageResources.player.faceHappy1SW.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Happy1SW, faceSprite);
        faceSprite = ImageResources.player.faceHappy1S.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Happy1S, faceSprite);
        faceSprite = ImageResources.player.faceHappy1SE.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Happy1SE, faceSprite);
        faceSprite = ImageResources.player.faceHappy1E.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Happy1E, faceSprite);
        faceSprite = ImageResources.player.faceHappy1NE.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Happy1NE, faceSprite);

        faceSprite = ImageResources.player.faceHappy2.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Happy2, faceSprite);

        faceSprite = ImageResources.player.faceAnnoyed.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Annoyed, faceSprite);

        faceSprite = ImageResources.player.faceGoofy.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Goofy, faceSprite);

        faceSprite = ImageResources.player.faceMiffed.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Miffed, faceSprite);

        faceSprite = ImageResources.player.faceMischievous.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Mischievous, faceSprite);

        faceSprite = ImageResources.player.faceRelieved.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Relieved, faceSprite);

        faceSprite = ImageResources.player.faceWorried.toSprite();
        faceSprite.width = this.width;
        faceSprite.height = this.height;
        this._faceActor.graphics.add(PlayerFaces.Worried, faceSprite);

        this.useFace(PlayerFaces.Happy1);
    }

    private useFace(face: PlayerFaces) {
        if (face === PlayerFaces.Happy1) {
            const mousePos = this.scene?.engine.input.pointers.primary.lastWorldPos;
            if (mousePos) {
                const mouseIsHorizontallyCentered = mousePos.x >= this.pos.x - 20 && mousePos.x <= this.pos.x + 20;
                const isNorth = mouseIsHorizontallyCentered && mousePos.y < this.pos.y;
                const isSouth = mouseIsHorizontallyCentered && mousePos.y > this.pos.y;
                const isWestern = mousePos.x < this.pos.x - 20;
                const isEastern = mousePos.x > this.pos.x + 20;
                const mouseIsVerticallyCentered = mousePos.y >= this.pos.y - 20 && mousePos.y <= this.pos.y + 20;
                const isWest = mouseIsVerticallyCentered && mousePos.x < this.pos.x;
                const isEast = mouseIsVerticallyCentered && mousePos.x > this.pos.x;
                const isNorthern = mousePos.y < this.pos.y - 20;
                const isSouthern = mousePos.y > this.pos.y + 20;

                if (isNorthern && isWestern) {
                    face = PlayerFaces.Happy1NW;
                } else if (isWest) {
                    face = PlayerFaces.Happy1W;
                } else if (isSouthern && isWestern) {
                    face = PlayerFaces.Happy1SW;
                } else if (isSouth) {
                    face = PlayerFaces.Happy1S;
                } else if (isSouthern && isEastern) {
                    face = PlayerFaces.Happy1SE;
                } else if (isEast) {
                    face = PlayerFaces.Happy1E;
                } else if (isNorthern && isEastern) {
                    face = PlayerFaces.Happy1NE;
                } else {
                    face = PlayerFaces.Happy1N;
                }
            }
        }

        if (this._usingFace === face) {
            return;
        }

        this._usingFace = face;
        this._faceActor.graphics.use(this._usingFace);
    }

    private updateFaceSprite(_delta: number) {
        this.lastAnimTick += _delta;
        if (this.lastAnimTick >= this.animDeltaMs) {
            this.lastAnimTick = 0;
            this.animFrame = (this.animFrame + 1) % 2;

            if (this.animFrame === 0 || !rand.bool()) {
                this._faceActor.pos = vec(0, 0);
            } else {
                this._faceActor.pos = vec(rand.integer(-1, 1), rand.integer(-1, 1));
            }

            this.pickNextAnimDelta();
        }

        if (this._usingFace.startsWith(PlayerFaces.Happy1)) {
            this.useFace(PlayerFaces.Happy1);
        }
    }

    private pickNextAnimDelta() {
        this.animDeltaMs = rand.integer(450, 750);
    }

    private updatePathLines(_engine: Engine) {
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
                x: source.pos.x + 1,
                y: source.pos.y + 1,
                z: Constants.PathLineZIndex,
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

    public onPostUpdate(_engine: Engine, _delta: number): void {
        this.updateFaceSprite(_delta);
        this.updatePathLines(_engine);
    }

    private onPostSelect() {
        Audio.playSelectedSfx(this.path.length);
        this.updateScoreUi();
        this.postActionUpdateFace();
    }

    private postActionUpdateFace() {
        const tailNeighbors = this.pathTail.getOrthogonalNeighbors();
        const enragedNeighbors = tailNeighbors.filter(c => c.occupant instanceof EnemyCharacter && (c.occupant as EnemyCharacter).enraged && !(c.occupant as EnemyCharacter).selected);
        if (enragedNeighbors.length > 0) {
            this.useFace(PlayerFaces.Worried);
        } else if (this.path.length > 0) {
            this.useFace(PlayerFaces.Mischievous);
        } else {
            this.useFace(PlayerFaces.Happy1);
        }
    }

    public select(enemy?: CellOccupant) {
        if (enemy instanceof PlayerCharacter) {
            for (let c of this.path) {
                if (isHoverable(c.occupant)) {
                    c.occupant.pointerdown();
                }
            }

            this.path.length = 0;
            this.onPostSelect();
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
            this.onPostSelect();
            return;
        }

        this.path.push(enemy!.cell);
        if (isHoverable(enemy)) {
            enemy.pointerdown();
        }

        this.onPostSelect();
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
        if (this.path.length >= Constants.MinPathSizeToSpawnGem) {
            this.willScoreVal.textContent += "💎";
        }

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
        const chainLength = this.path.length;

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
            if (this.path[killIdx].occupant instanceof Actor) {
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
                .callMethod(() => this.useFace(PlayerFaces.Relieved))
                .delay(3000)
                .callMethod(() => this.gameScene.events.emit(GameSceneEvents.CompleteStage));
        } else {
            moveChain = moveChain.callMethod(() => {
                this._cell.occupant = undefined;
                this._cell = this.path[this.path.length - 1];
                this._cell.occupant = this;
                this.path.length = 0;
                this.updateScoreUi();
            });

            if (this.path.length >= Constants.MinPathSizeToSpawnGem) {
                moveChain = this.spawnGem(moveChain);
            }

            moveChain = moveChain.delay(
                1000
            );

            moveChain.toPromise().then(() => {
                const t = new TurnEndedEvent(chainLength);
                this.events.emit(PlayerEvents.TurnEnded, t);

                let moveChain = this.actions.delay(0);
                if (t.numAttacks > 0) {
                    this.health -= t.numAttacks;
                    Audio.playImpactSfx();
                    if (this.health > 0) {
                        moveChain = moveChain.callMethod(
                            () => this.useFace(PlayerFaces.Annoyed)
                        ).repeat(
                            ctx => {
                                ctx.flash(Color.White, 50).delay(50);
                            }, 4
                        ).callMethod(
                            () => this.useFace(PlayerFaces.Happy1)
                        );
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
                    this.postActionUpdateFace();
                    this.events.emit(PlayerEvents.NextTurnStarted);
                });
            });
        }
    }

    private spawnGem(moveChain: ActionContext): ActionContext {
        let validTargetCells = this.gameScene.cells.filter(c =>
            c.occupant instanceof EnemyCharacter &&
            !this.path.includes(c) &&
            // don't pick a cell that's isolated off in a corner if we can avoid it. that's boring.
            c.getNeighbors().length > 2
        );
        if (validTargetCells.length === 0) {
            validTargetCells = this.gameScene.cells.filter(c => !c.occupant);
        }
        if (!validTargetCells || validTargetCells.length === 0) {
            Logger.getInstance().error("attempted to spawn gem, but no cells found to do so.");
            return moveChain;
        }

        validTargetCells.sort((a, b) => b.pos.squareDistance(this.pos) - a.pos.squareDistance(this.pos));
        // grab something in the second quartile of the list so it's some distance away from the player but not too far.
        const lowerBound = Math.trunc(validTargetCells.length / 4);
        const upperBound = lowerBound * 2;
        const targetCell = validTargetCells[rand.integer(lowerBound, upperBound)];
        const targetOccupant = targetCell.occupant;

        const vecToTarget = targetCell.pos.sub(this.pos);
        const playerTargetTrianglePoint = vecToTarget.rotate(toRadians(-45)).normalize();
        const playerCurveOffset = playerTargetTrianglePoint.scale(vecToTarget.magnitude / 1.75);

        const vecFromTarget = this.pos.sub(targetCell.pos);
        const targetPlayerTrianglePoint = vecFromTarget.rotate(toRadians(45)).normalize();
        const targetCurveOffset = targetPlayerTrianglePoint.scale(vecFromTarget.magnitude / 1.75);

        const playerCurveControlPoint = this.pos.add(playerCurveOffset);
        const targetCurveControlPoint = targetCell.pos.add(targetCurveOffset);

        moveChain = moveChain.
            callMethod(() => {
                const extender = new ChainExtender({
                    name: `chainextender-${targetCell.pos}`,
                    pos: this.pos,
                    width: this.width,
                    height: this.height,
                    collisionType: CollisionType.PreventCollision,
                    cell: targetCell,
                })
                this.scene?.add(extender);

                extender.actions.curveTo({
                    controlPoints: [playerCurveControlPoint, targetCurveControlPoint, targetCell.pos],
                    duration: 800,
                }).callMethod(() => targetOccupant!.kill());
            }).delay(
                800
            );

        return moveChain;
    }
}
