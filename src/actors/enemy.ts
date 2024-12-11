import { Actor, ActorArgs, Color, Engine, Line, Sprite, vec } from "excalibur";
import { ImageResources } from "../resource";
import { rand } from "../utilities/math";

export interface EnemyCharacterArgs extends ActorArgs {
    enemyType: number;
}

export class EnemyCharacter extends Actor {
    public enemyType: number = 0;
    public pointerWasMove: boolean = false;
    
    private _hovered: boolean = false;
    public get hovered() {
        return this._hovered;
    }
    public set hovered(newHovered: boolean) {
        this._hovered = newHovered;

        if (this.hovered) {
            this.color = new Color(240, 240, 240, 0.6);
            this.faceActor.graphics.use(this.surprisedSprite!);
            this.faceActor.pos = vec(0, 0);
        } else {
            this.color = Color.Transparent;
            this.faceActor.graphics.use(this.regularSprite!);
        }
    }

    public bodyActor: Actor;
    public faceActor: Actor;

    private regularSprite: Sprite | undefined;
    private surprisedSprite: Sprite | undefined;

    private animDeltaMs: number = 0;
    private lastAnimTick: number = 0;
    private animFrame: number = 0;

    constructor(config?: EnemyCharacterArgs) {
        super(config);

        this.enemyType = config?.enemyType ?? 0;

        this.bodyActor = new Actor({
            x: 0,
            y: 0,
            width: this.width - 2,
            height: this.height - 2,
        });
        this.addChild(this.bodyActor);

        this.faceActor = new Actor({
            x: 0,
            y: 0,
            width: 9,
            height: 6,
        });
        this.addChild(this.faceActor);

        // this.addOutline();
    }

    private addOutline() {
        const top = new Actor({
            width: this.width,
            height: this.height,
        });
        top.graphics.use(
            new Line({
                start: vec(0, -top.height / 2),
                end: vec(16, -top.height / 2),
                color: new Color(25, 25, 25, 0.2),
            }),
        );
        this.addChild(top);

        const bottom = new Actor({
            width: this.width,
            height: this.height,
        });
        bottom.graphics.use(
            new Line({
                start: vec(0, bottom.height / 2),
                end: vec(16, bottom.height / 2),
                color: new Color(25, 25, 25, 0.2),
            }),
        );
        this.addChild(bottom);

        const left = new Actor({
            width: this.width,
            height: this.height,
        });
        left.graphics.use(
            new Line({
                start: vec(-left.width / 2, 0),
                end: vec(-left.width / 2, 16),
                color: new Color(25, 25, 25, 0.2),
            }),
        );
        this.addChild(left);

        const right = new Actor({
            width: this.width,
            height: this.height,
        });
        right.graphics.use(
            new Line({
                start: vec(right.width / 2, 0),
                end: vec(right.width / 2, 16),
                color: new Color(25, 25, 25, 0.2),
            }),
        );
        this.addChild(right);
    }

    private pickNextAnimDelta() {
        this.animDeltaMs = rand.integer(450, 750);
    }

    public onInitialize(_engine: Engine): void {
        this.pickNextAnimDelta();

        const bodySprite = ImageResources.enemyBodies[this.enemyType].toSprite();
        bodySprite.width = this.bodyActor.width;
        bodySprite.height = this.bodyActor.height;
        this.bodyActor.graphics.use(bodySprite);

        this.regularSprite = ImageResources.enemyFaces.happy.toSprite();
        this.regularSprite.width = this.faceActor.width;
        this.regularSprite.height = this.faceActor.height;

        this.surprisedSprite = ImageResources.enemyFaces.surprised.toSprite();
        this.surprisedSprite.width = this.faceActor.width + 1;
        this.surprisedSprite.height = this.faceActor.height + 1;

        this.faceActor.graphics.use(this.regularSprite);
    }

    public onPostUpdate(_engine: Engine, _delta: number): void {
        if (this.hovered) {
            return;
        }

        this.lastAnimTick += _delta;
        if (this.lastAnimTick >= this.animDeltaMs) {
            this.lastAnimTick = 0;
            this.animFrame = (this.animFrame + 1) % 2;

            if (this.animFrame === 0 || !rand.bool()) {
                this.faceActor.pos = vec(0, 0);
            } else {
                this.faceActor.pos = vec(rand.integer(-1, 1), rand.integer(-1, 1));
            }

            this.pickNextAnimDelta();
        }
    }
}
