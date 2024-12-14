import { Actor, ActorArgs, Color, Engine, Rectangle } from "excalibur";
import { GameScene } from "../scenes/game-scene";
import { PlayerCharacter } from "./player";
import { EnemyCharacter, Hoverable, isHoverable } from "./enemy";

export interface CellOccupant extends Actor {
    canHover(pathTail: Cell): boolean
}

export type CellArgs = ActorArgs & {
}

export class Cell extends Actor implements Hoverable {
    private _desiredHoverColor: Color = Color.Transparent;
    private _validHoverColor: Color = new Color(240, 240, 240, 0.6);
    private _invalidHoverColor: Color = Color.Red;
    private _box: Rectangle;

    private _occupant?: CellOccupant;
    public get occupant() {
        return this._occupant;
    }
    public set occupant(actor: CellOccupant | undefined) {
        this._occupant = actor;
    }

    public get gameScene() {
        return this.scene as GameScene;
    }

    public get selected() { return false; }

    private _hovered: boolean = false;
    public get hovered() {
        return this._hovered;
    }
    public set hovered(newHovered: boolean) {
        if (this._hovered == newHovered || !this.occupant || (this.occupant instanceof PlayerCharacter && newHovered)) {
            return;
        }

        this._hovered = newHovered;

        if (this.hovered) {
            const pathTail = this.gameScene.player!.pathTail;
            const neighbors = this.gameScene.player!.pathTail.getNeighbors();

            if ((neighbors.includes(this) || this == pathTail ||
                (isHoverable(this.occupant) && this.occupant.selected)) &&
                this.occupant && this.occupant.canHover(pathTail)) {
                this._desiredHoverColor = this._validHoverColor;

                if (isHoverable(this.occupant)) {
                    this.occupant.hovered = true;
                }
            } else {
                this._desiredHoverColor = this._invalidHoverColor;
            }
        } else {
            this._desiredHoverColor = Color.Transparent;

            if (isHoverable(this.occupant) && this.occupant.hovered) {
                this.occupant.hovered = false;
            }
        }
    }

    constructor(config?: CellArgs) {
        super(config);

        this._box = new Rectangle({
            width: this.width,
            height: this.height,
            color: this.color,
        });
    }

    onInitialize(engine: Engine): void {
        this.graphics.use(this._box);
    }

    pointerdown(): void {
        if ((isHoverable(this.occupant) && this.occupant.hovered) || this.occupant instanceof PlayerCharacter) {
            this.gameScene.player?.select(this.occupant as EnemyCharacter);
        }
    }

    onPostUpdate(_engine: Engine, _delta: number): void {
        if (!this.gameScene.pointerDown) {
            if (!this.color.equal(this._desiredHoverColor)) {
                this.color = this._desiredHoverColor;
                this._box.color = this.color;
            }
        } else if (!this.color.equal(Color.Transparent)) {
            this.color = Color.Transparent;
            this._box.color = this.color;
        }
    }

    public getNeighbors(): Cell[] {
        const neighbors = this.gameScene.cells.filter((c) =>
            c.id != this.id &&
            c.pos.x >= this.pos.x - this.width &&
            c.pos.x <= this.pos.x + this.width &&
            c.pos.y >= this.pos.y - this.height &&
            c.pos.y <= this.pos.y + this.height
        );

        return neighbors;
    }

    public getCellBeneath(): Cell | undefined {
        const southNeighbor = this.gameScene.cells.find((c) =>
            c.pos.y === this.pos.y + this.height &&
            c.pos.x === this.pos.x
        );

        return southNeighbor;
    }

    public getFurthestUnoccupiedCellBeneath(): Cell | undefined {
        const southNeighbors = this.gameScene.cells.filter((c) =>
            c.pos.y > this.pos.y &&
            c.pos.x === this.pos.x &&
            !c.occupant
        );

        const reverseSorted = southNeighbors.sort((a, b) => b.pos.y - a.pos.y);
        const furthest = reverseSorted.shift();
        return furthest;
    }
}
