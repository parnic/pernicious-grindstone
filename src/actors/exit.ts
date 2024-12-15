import { Actor, ActorArgs, Engine, Sprite } from "excalibur";
import { GameScene, GameSceneEvents } from "../scenes/game-scene";
import { Cell, CellOccupant } from "./cell";
import { Hoverable } from "./enemy";
import { ResourceManager } from "../utilities/resource-manager";

export type ExitArgs = ActorArgs & {
    cell: Cell;
}

export class Exit extends Actor implements Hoverable, CellOccupant {
    private _closedSprite?: Sprite;
    private _openSprite?: Sprite;
    private _body: Actor;

    public get gameScene() {
        return this.scene as GameScene;
    }

    private _selected: boolean = false;
    public get selected() { return this._selected; }

    private _cell: Cell;
    public get cell() {
        return this._cell;
    }
    public set cell(c: Cell) {
        this._cell = c;
    }

    private _hovered: boolean = false;
    public get hovered() {
        return this._hovered;
    }
    public set hovered(newHovered: boolean) {
        if (this._hovered == newHovered) {
            return;
        }

        this._hovered = newHovered;
    }

    constructor(config?: ExitArgs) {
        super(config);

        this._cell = config!.cell;
        this._cell.occupant = this;

        this._body = new Actor({
            width: this.width - 2,
            height: this.height - 2,
        });
        this.addChild(this._body);
    }

    onInitialize(engine: Engine): void {
        this._closedSprite = ResourceManager.getClosedExitSprite();
        this._openSprite = ResourceManager.getOpenExitSprite();

        this._body.graphics.use(this._closedSprite);

        this.gameScene.events.once(GameSceneEvents.TargetScoreReached, () => this.open = true);
    }

    public pointerdown() {
        this._selected = !this.selected;
    }

    private _open: boolean = false;
    public get open(): boolean {
        return this._open;
    }
    public set open(inOpen: boolean) {
        const changed = inOpen != this._open;
        if (!changed) {
            return;
        }

        this._open = inOpen;
        if (this._open) {
            this._body.graphics.use(this._openSprite!);
        }
    }

    canHover(pathTail: Cell): boolean {
        return this.open
            || this.gameScene.player!.score + this.gameScene.player!.path.length >= this.gameScene.targetScore;
    }
}
