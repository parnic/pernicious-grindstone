import { Actor, ActorArgs, Color, Engine, Line, Sprite, vec } from "excalibur";
import { ImageResources } from "../resource";
import { rand } from "../utilities/math";
import { Cell } from "./cell";
import { GameScene } from "../scenes/game-scene";

export interface EnemyCharacterArgs extends ActorArgs {
    enemyType: number;
    cell: Cell;
}

export class EnemyCharacter extends Actor {
    public enemyType: number = 0;
    public pointerWasMove: boolean = false;

    private _cell: Cell;
    public get cell() {
        return this._cell;
    }

    public get gameScene() {
        return this.scene as GameScene;
    }

    private _selected: boolean = false;
    public get selected() {
        return this._selected;
    }
    private set selected(newSelected: boolean) {
        this._selected = newSelected;
        if (this.selected) {
            this.faceActor.graphics.use(this.deadSprite!);
        } else if (this.hovered) {
            this.faceActor.graphics.use(this.surprisedSprite!);
        } else {
            this.faceActor.graphics.use(this.regularSprite!);
        }
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

        if (this.hovered) {
            // todo: this should be checking the neighbor of the last guy in the path, not the player. but we don't have a path yet.
            const neighbors = this.gameScene.player!.cell.getNeighbors();
            if (neighbors.includes(this.cell)) {
                this.color = new Color(240, 240, 240, 0.6);
            } else {
                this.color = Color.Red;
            }

            if (!this.selected) {
                this.faceActor.graphics.use(this.surprisedSprite!);
            }
            this.faceActor.pos = vec(0, 0);
        } else {
            this.color = Color.Transparent;
            if (!this.selected) {
                this.faceActor.graphics.use(this.regularSprite!);
            }
        }
    }

    public bodyActor: Actor;
    public faceActor: Actor;

    private regularSprite: Sprite | undefined;
    private surprisedSprite: Sprite | undefined;
    private surprised2Sprite: Sprite | undefined;
    private deadSprite: Sprite | undefined;

    private animDeltaMs: number = 0;
    private lastAnimTick: number = 0;
    private animFrame: number = 0;

    constructor(config?: EnemyCharacterArgs) {
        super(config);

        this.enemyType = config?.enemyType ?? 0;
        this._cell = config?.cell!;
        this._cell.occupant = this;

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

        this.surprised2Sprite = ImageResources.enemyFaces.surprisedBlinking.toSprite();
        this.surprised2Sprite.width = this.faceActor.width + 1;
        this.surprised2Sprite.height = this.faceActor.height + 1;

        this.deadSprite = ImageResources.enemyFaces.dead.toSprite();
        this.deadSprite.width = this.faceActor.width;
        this.deadSprite.height = this.faceActor.height;

        this.faceActor.graphics.use(this.regularSprite);
    }

    public onPostUpdate(_engine: Engine, _delta: number): void {
        if (this.selected) {
            return;
        }

        this.lastAnimTick += _delta;
        if (this.lastAnimTick >= this.animDeltaMs) {
            this.lastAnimTick = 0;
            this.animFrame = (this.animFrame + 1) % 2;

            if (this.animFrame === 0 || !rand.bool()) {
                if (this.hovered) {
                    this.faceActor.graphics.use(this.surprisedSprite!);
                }

                this.faceActor.pos = vec(0, 0);
            } else {
                if (this.hovered) {
                    this.faceActor.graphics.use(this.surprised2Sprite!);
                } else {
                    this.faceActor.pos = vec(rand.integer(-1, 1), rand.integer(-1, 1));
                }
            }

            this.pickNextAnimDelta();
        }
    }

    public pointerup() {
        this.selected = !this.selected;
    }
}
