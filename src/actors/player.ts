import { Actor, ActorArgs, Engine } from "excalibur";
import { ResourceManager } from "../utilities/resource-manager";

export interface PlayerCharacterArgs extends ActorArgs {
}

export class PlayerCharacter extends Actor {
    constructor(config?: PlayerCharacterArgs) {
        super(config);
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
