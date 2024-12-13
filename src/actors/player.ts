import { Actor, ActorArgs, EasingFunctions, ElasticToActorStrategy, Engine, Line, Logger, Vector } from "excalibur";
import { ResourceManager } from "../utilities/resource-manager";
import { Cell } from "./cell";
import { GameScene } from "../scenes/game-scene";
import { EnemyCharacter, isHoverable } from "./enemy";
import { rand } from "../utilities/math";

export type PlayerCharacterArgs = ActorArgs & {
    cell: Cell;
}

export class PlayerCharacter extends Actor {
    willScoreRoot: HTMLElement;
    willScoreVal: HTMLElement;
    scoreRoot: HTMLElement;
    scoreVal: HTMLElement;
    goButton: HTMLElement;

    private _score: number = 0;
    private _going: boolean = false;

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

    constructor(config?: PlayerCharacterArgs) {
        super(config);

        this._cell = config?.cell!;
        this._cell.occupant = this;

        this.willScoreRoot = document.getElementById('pathElement')!;
        this.willScoreVal = document.getElementById('pathScore')!;
        this.scoreRoot = document.getElementById('scoreElement')!;
        this.scoreVal = document.getElementById('score')!;
        this.goButton = document.getElementById('btnGo')!;
    }

    public onInitialize(_engine: Engine): void {
        const body = new Actor({
            width: this.width - 2,
            height: this.height - 2,
        });
        body.graphics.use(ResourceManager.getPlayerSprite());

        this.addChild(body);

        this.goButton.addEventListener('click', () => {
            this.go();
        });
        this.goButton.classList.remove('hide');
        this.goButton.classList.add('show');
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
                x: source.pos.x,
                y: source.pos.y,
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
            return;
        }

        this.path.push(enemy!.cell);
        enemy!.pointerdown();

        this.updateScoreUi();
    }

    updateScoreUi() {
        if (this.path.length === 0) {
            this.willScoreRoot.classList.add('hide');
            this.willScoreRoot.classList.remove('show');
            this.goButton.setAttribute("disabled", "true");
        } else {
            this.willScoreRoot.classList.add('show');
            this.willScoreRoot.classList.remove('hide');
            this.goButton.removeAttribute("disabled");
        }
        this.willScoreVal.textContent = `${this.path.length}`;
    }

    public get pathTail(): Cell {
        if (this.path.length > 0) {
            return this.path[this.path.length - 1];
        }

        return this.cell;
    }

    private addScore(points: number = 1) {
        this._score += points;
        this.scoreVal.textContent = `${this._score}`;

        this.scoreRoot.classList.remove('hide');
        this.scoreRoot.classList.add('show');
    }

    public go(): void {
        if (this._going) {
            return;
        }

        this._going = true;

        const moveDurationMax = 200;
        const moveDurationMin = 30;
        const delayMin = 15;

        let moveDuration = moveDurationMax;
        let delay = 100;

        const camStrategy = new ElasticToActorStrategy(this, 0.1, 0.9);
        const origCamPos = this.scene!.camera.pos;

        let idx = 0;
        let moveChain = this.actions.moveTo({pos: this.path[idx].pos, duration: moveDuration, easing: EasingFunctions.EaseInQuad}).callMethod(() => this.path[0].occupant?.kill()).callMethod(() => this.addScore(1));
        for (idx = 1; idx < this.path.length; idx++) {
            const killIdx = idx;
            moveChain = moveChain.delay(delay);
            // todo: move speed frequently puts the player past the target location and then snaps them back, visibly.
            // can we fix it? somehow?
            moveChain = moveChain.moveTo({pos: this.path[idx].pos, duration: moveDuration, easing: EasingFunctions.EaseInQuad});
            moveChain = moveChain.callMethod(() => this.path[killIdx].occupant?.kill());
            moveChain = moveChain.callMethod(() => this.addScore(1));
            if (killIdx === 9) {
                moveChain = moveChain.callMethod(() => this.scene!.camera.addStrategy(camStrategy));
            }
            if (killIdx % 9 === 0) {
                const adder = killIdx / 900;
                moveChain = moveChain.callMethod(() => this.scene!.camera.zoomOverTime(1.05 + adder, 500, EasingFunctions.EaseInOutCubic));
            }

            const shakeScaler = Math.trunc(idx / 5);
            const shakeXMin = Math.max(1, Math.min(3, shakeScaler));
            const shakeXMax = Math.max(1, Math.min(5, shakeScaler + 2));
            moveChain = moveChain.callMethod(() => this.scene!.camera.shake(rand.integer(shakeXMin, shakeXMax), rand.integer(0, 2), delay));

            delay = Math.max(delayMin, delay * 0.85);
            moveDuration = Math.max(moveDurationMin, moveDuration * 0.85);
        }

        moveChain = moveChain.callMethod(() => {
            this._cell.occupant = undefined;
            this._cell = this.path[this.path.length - 1];
            this._cell.occupant = this;
            this.path.length = 0;
            this.updateScoreUi();
        }).delay(
            1500
        ).callMethod(() => {
            this.scene!.camera.removeStrategy(camStrategy);
            this.scene!.camera.move(origCamPos, 250, EasingFunctions.EaseInOutCubic);
            this.scene!.camera.zoomOverTime(1, 250, EasingFunctions.EaseInOutCubic);

            this.gameScene.refillEnemies();
            this._going = false;
        });
    }
}
