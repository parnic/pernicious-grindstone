import { Actor, ActorArgs, Color } from "excalibur";
import { GameScene } from "../scenes/game-scene";
import { PlayerCharacter } from "./player";
import { EnemyCharacter, Hoverable, isHoverable } from "./enemy";

export interface CellArgs extends ActorArgs {
}

export class Cell extends Actor implements Hoverable {
    public pointerWasMove: boolean = false;

    private _occupant?: Actor;
    public get occupant() {
        return this._occupant;
    }
    public set occupant(actor: Actor | undefined) {
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
        if (this._hovered == newHovered || !this.occupant || this.occupant instanceof PlayerCharacter) {
            return;
        }

        this._hovered = newHovered;

        if (this.hovered) {
            let pathTail = this.gameScene.player!.pathTail;
            let pathTailOccupant = pathTail.occupant as EnemyCharacter | PlayerCharacter;
            const pathTailEnemyType = (pathTailOccupant as EnemyCharacter)?.enemyType;

            const occupantEnemyType = (this.occupant as EnemyCharacter)?.enemyType;

            const occupantSameTypeAsPathTail = (pathTailOccupant instanceof PlayerCharacter) || pathTailEnemyType === occupantEnemyType;

            const neighbors = this.gameScene.player!.pathTail.getNeighbors();

            if ((neighbors.includes(this) || this == pathTail ||
                (isHoverable(this.occupant) && this.occupant.selected)) &&
                occupantSameTypeAsPathTail) {
                this.color = new Color(240, 240, 240, 0.6);

                if (isHoverable(this.occupant)) {
                    this.occupant.hovered = true;
                }
            } else {
                this.color = Color.Red;
            }
        } else {
            this.color = Color.Transparent;

            if (isHoverable(this.occupant) && this.occupant.hovered) {
                this.occupant.hovered = false;
            }
        }
    }

    constructor(config?: CellArgs) {
        super(config);
    }

    pointerdown(): void {
        if ((isHoverable(this.occupant) && this.occupant.hovered) || this.occupant instanceof PlayerCharacter) {
            this.gameScene.player?.select(this.occupant as EnemyCharacter);
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
