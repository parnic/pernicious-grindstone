import { Actor, ActorArgs } from "excalibur";
import { GameScene } from "../scenes/game-scene";

export interface CellArgs extends ActorArgs {
}

export class Cell extends Actor {
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

    constructor(config?: CellArgs) {
        super(config);
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
