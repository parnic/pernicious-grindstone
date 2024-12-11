import { Actor, ActorArgs, Engine } from "excalibur";
import { ResourceManager } from "../utilities/resource-manager";
import { Cell } from "./cell";
import { GameScene } from "../scenes/game-scene";

export interface PlayerCharacterArgs extends ActorArgs {
    cell: Cell;
}

export class PlayerCharacter extends Actor {
    private _cell: Cell;
    public get cell() {
        return this._cell;
    }

    public get gameScene() {
        return this.scene as GameScene;
    }

    constructor(config?: PlayerCharacterArgs) {
        super(config);

        this._cell = config?.cell!;
        this._cell.occupant = this;
    }

    public onInitialize(_engine: Engine): void {
        const body = new Actor({
            width: this.width - 2,
            height: this.height - 2,
        });
        body.graphics.use(ResourceManager.getPlayerSprite());

        this.addChild(body);
    }
}
