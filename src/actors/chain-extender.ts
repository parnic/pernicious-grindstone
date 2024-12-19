import { Actor, ActorArgs, Engine, Scene } from "excalibur";
import { Cell, CellOccupant } from "./cell";
import { Hoverable } from "./enemy";
import { ResourceManager } from "../utilities/resource-manager";
import { Constants } from "../utilities/constants";

export type ChainExtenderArgs = ActorArgs & {
    cell: Cell;
}

export class ChainExtender extends Actor implements Hoverable, CellOccupant {
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

    pointerdown(): void {
        this.selected = !this.selected;
    }

    private _selected: boolean = false;
    public get selected() {
        return this._selected;
    }
    private set selected(newSelected: boolean) {
        this._selected = newSelected;
    }

    canHover(pathTail: Cell): boolean {
        return true;
    }

    constructor(args: ChainExtenderArgs) {
        super(args);

        this.z = Constants.ChainExtenderZIndex;

        this._cell = args.cell;
        this._cell.occupant = this;
    }

    onInitialize(engine: Engine): void {
        this.graphics.use(ResourceManager.getGemSpriteAnimation());
    }

    onPostKill(_scene: Scene): void {
        this.cell.occupant = undefined;
    }
}
