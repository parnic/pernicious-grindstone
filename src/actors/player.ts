import { Actor, ActorArgs, Engine, Line, Vector } from "excalibur";
import { ResourceManager } from "../utilities/resource-manager";
import { Cell } from "./cell";
import { GameScene } from "../scenes/game-scene";
import { EnemyCharacter, isHoverable } from "./enemy";

export interface PlayerCharacterArgs extends ActorArgs {
    cell: Cell;
}

export class PlayerCharacter extends Actor {
    scoreRoot: HTMLElement;
    scoreVal: HTMLElement;

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

        this.scoreRoot = document.getElementById('pathElement')!;
        this.scoreVal = document.getElementById('pathScore')!;
    }

    public onInitialize(_engine: Engine): void {
        const body = new Actor({
            width: this.width - 2,
            height: this.height - 2,
        });
        body.graphics.use(ResourceManager.getPlayerSprite());

        this.addChild(body);
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
            this.scoreRoot.classList.add('hide');
            this.scoreRoot.classList.remove('show');
        } else {
            this.scoreRoot.classList.add('show');
            this.scoreRoot.classList.remove('hide');
        }
        this.scoreVal.textContent = `${this.path.length}`;
    }

    public get pathTail(): Cell {
        if (this.path.length > 0) {
            return this.path[this.path.length - 1];
        }

        return this.cell;
    }
}
