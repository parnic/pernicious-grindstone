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
        let neighbors = this.gameScene.cells.filter((c) =>
            c.id != this.id &&
            c.pos.x >= this.pos.x - this.width &&
            c.pos.x <= this.pos.x + this.width &&
            c.pos.y >= this.pos.y - this.height &&
            c.pos.y <= this.pos.y + this.height);
        return neighbors;
    }
}
