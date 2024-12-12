import { Actor, ActorArgs, Color, Engine, Line, Sprite, vec } from "excalibur";
import { ImageResources } from "../resource";
import { rand } from "../utilities/math";
import { Cell } from "./cell";
import { GameScene } from "../scenes/game-scene";
import { PlayerCharacter } from "./player";

export interface EnemyCharacterArgs extends ActorArgs {
    enemyType: number;
    cell: Cell;
}

export interface Hoverable {
    get hovered(): boolean;
    set hovered(inHovered: boolean);
    pointerup(): void;
    get selected(): boolean;
}

interface EnemySprites {
    body?: Sprite | undefined;
    regular?: Sprite | undefined;
    surprised?: Sprite | undefined;
    surprised2?: Sprite | undefined;
    dead?: Sprite | undefined;
}

export function isHoverable(object: any): object is Hoverable {
    return (object as Hoverable).hovered !== undefined;
}

export class EnemyCharacter extends Actor implements Hoverable {
    public enemyType: number = 0;
    private fadedColor: Color = new Color(127, 127, 127, 0.5);

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
            this.faceActor.graphics.use(this.sprites.dead!);
        } else if (this.hovered) {
            this.faceActor.graphics.use(this.sprites.surprised!);
        } else {
            this.faceActor.graphics.use(this.sprites.regular!);
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
            if (!this.selected) {
                this.faceActor.graphics.use(this.sprites.surprised!);
            }
            this.faceActor.pos = vec(0, 0);
        } else {
            if (!this.selected) {
                this.faceActor.graphics.use(this.sprites.regular!);
            }
        }
    }

    public bodyActor: Actor;
    public faceActor: Actor;

    private sprites: EnemySprites = {};

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

        this.sprites = {};

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

        this.sprites.body = ImageResources.enemyBodies[this.enemyType].toSprite();
        this.sprites.body.width = this.bodyActor.width;
        this.sprites.body.height = this.bodyActor.height;
        this.bodyActor.graphics.use(this.sprites.body);

        this.sprites.regular = ImageResources.enemyFaces.happy.toSprite();
        this.sprites.regular.width = this.faceActor.width;
        this.sprites.regular.height = this.faceActor.height;

        this.sprites.surprised = ImageResources.enemyFaces.surprised.toSprite();
        this.sprites.surprised.width = this.faceActor.width + 1;
        this.sprites.surprised.height = this.faceActor.height + 1;

        this.sprites.surprised2 = ImageResources.enemyFaces.surprisedBlinking.toSprite();
        this.sprites.surprised2.width = this.faceActor.width + 1;
        this.sprites.surprised2.height = this.faceActor.height + 1;

        this.sprites.dead = ImageResources.enemyFaces.dead.toSprite();
        this.sprites.dead.width = this.faceActor.width;
        this.sprites.dead.height = this.faceActor.height;

        this.faceActor.graphics.use(this.sprites.regular);
    }

    public onPostUpdate(_engine: Engine, _delta: number): void {
        const pathTail = this.gameScene.player!.pathTail;
        if (pathTail.occupant instanceof PlayerCharacter || (pathTail.occupant as EnemyCharacter).enemyType === this.enemyType) {
            this.setSpritesColor(Color.White);
        } else {
            this.setSpritesColor(this.fadedColor);
        }

        if (this.selected) {
            return;
        }

        this.lastAnimTick += _delta;
        if (this.lastAnimTick >= this.animDeltaMs) {
            this.lastAnimTick = 0;
            this.animFrame = (this.animFrame + 1) % 2;

            if (this.animFrame === 0 || !rand.bool()) {
                if (this.hovered) {
                    this.faceActor.graphics.use(this.sprites.surprised!);
                }

                this.faceActor.pos = vec(0, 0);
            } else {
                if (this.hovered) {
                    this.faceActor.graphics.use(this.sprites.surprised2!);
                } else {
                    this.faceActor.pos = vec(rand.integer(-1, 1), rand.integer(-1, 1));
                }
            }

            this.pickNextAnimDelta();
        }
    }

    private setSpritesColor(color: Color) {
        for (let s of Object.values(this.sprites).map((s) => s as Sprite)) {
            s.tint = color;
        }
    }

    public pointerup() {
        this.selected = !this.selected;
    }
}
