import { Actor, ActorArgs, Color } from "excalibur";

export interface EnemyCharacterArgs extends ActorArgs {
    enemyType: number;
}

export class EnemyCharacter extends Actor {
    public enemyType: number = 0;

    constructor(config?: EnemyCharacterArgs) {
        super(config);

        this.enemyType = config?.enemyType ?? 0;
    }
}
