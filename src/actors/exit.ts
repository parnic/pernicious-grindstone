import { Actor, ActorArgs, Color, Rectangle } from "excalibur";
import { GameScene } from "../scenes/game-scene";
import { Cell, CellOccupant } from "./cell";
import { Hoverable } from "./enemy";

export type ExitArgs = ActorArgs & {
    cell: Cell;
}

export class Exit extends Actor implements Hoverable, CellOccupant {
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
    }

    public pointerdown() {
        this._selected = !this.selected;
    }

    public get open(): boolean {
        return false;
    }

    canHover(pathTail: Cell): boolean {
        return this.open;
    }
}
