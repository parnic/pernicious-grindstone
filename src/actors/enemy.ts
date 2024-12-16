import { ActionSequence, Actor, ActorArgs, Color, EmitterType, Engine, GpuParticleEmitter, Line, ParallelActions, ParticleTransform, Scene, Sprite, vec, Vector } from "excalibur";
import { ImageResources } from "../resource";
import { rand } from "../utilities/math";
import { Cell, CellOccupant } from "./cell";
import { GameScene } from "../scenes/game-scene";
import { PlayerCharacter } from "./player";
import { Exit } from "./exit";

export type EnemyCharacterArgs = ActorArgs & {
    enemyType: number;
    cell: Cell;
}

export interface Hoverable {
    get hovered(): boolean;
    set hovered(inHovered: boolean);
    pointerdown(): void;
    get selected(): boolean;
}

interface EnemySprites {
    body?: Sprite | undefined;
    regular?: Sprite | undefined;
    surprised?: Sprite | undefined;
    surprised2?: Sprite | undefined;
    dead?: Sprite | undefined;
    enraged?: Sprite | undefined;
}

export function isHoverable(object: any): object is Hoverable {
    return object && (object as Hoverable).hovered !== undefined;
}

export function spawnDieEffect(pos: Vector, scene: Scene): void {
    // var emitter = new GpuParticleEmitter({
    //     pos: pos,
    //     emitRate: 100,
    //     maxParticles: rand.integer(8, 15),
    //     emitterType: EmitterType.Rectangle,
    //     width: 16,
    //     height: 16,
    //     // radius: 10,
    //     random: rand,
    //     particle: {
    //         pos: pos,
    //         beginColor: Color.Red,
    //         endColor: Color.White,
    //         fade: true,
    //         opacity: 1,
    //         vel: vec(rand.floating(0, Math.PI), rand.floating(0, Math.PI)),
    //         focus: vec(rand.integer(-12, 12), rand.integer(-12, 12)),
    //         startSize: rand.integer(2, 5),
    //         endSize: rand.integer(2, 5),
    //         life: rand.integer(300, 500),
    //         minSpeed: 10,
    //         maxSpeed: 20,
    //         angularVelocity: 4,
    //         randomRotation: true,
    //         transform: ParticleTransform.Local
    //     },
    // });
    // emitter.isEmitting = true;
    // emitter.actions.delay(rand.integer(300, 500)).die();
    // scene.add(emitter);
    const numFragments = rand.integer(5, 8);
    for (let i = 0; i < numFragments; i++) {
        const x = rand.integer(2, 5);
        const y = rand.integer(2, 5);
        const dir = vec(rand.integer(-12, 12), rand.integer(-12, 12));
        const rot = rand.floating(0, Math.PI * 2);
        const vel = rand.floating(0, Math.PI);
        const color = new Color(rand.integer(100, 240), rand.integer(100, 240), rand.integer(100, 240), 1);//rand.floating(0.8, 0.95));
        const act = new Actor({
            x: pos.x,
            y: pos.y,
            width: x,
            height: y,
            rotation: rot,
            angularVelocity: vel,
            color: color,
        })

        const move = new ActionSequence(act, ctx => {
            ctx.moveBy(dir, rand.integer(10, 20));
        });

        const fade = new ActionSequence(act, ctx => {
            ctx.fade(0, rand.integer(800, 1500));
        })

        const parallel = new ParallelActions([move, fade]);
        act.actions.runAction(parallel).die();

        scene.add(act);
    }
}

export class EnemyCharacter extends Actor implements Hoverable, CellOccupant {
    public enemyType: number = 0;
    private fadedColor: Color = new Color(127, 127, 127, 0.5);

    private _cell: Cell;
    public get cell() {
        return this._cell;
    }
    public set cell(c: Cell) {
        this._cell = c;
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
        this.updateFaceSprite();
    }

    private _neighborSelected: boolean = false;
    public get neighborSelected(): boolean {
        return this._neighborSelected;
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
            this.updateFaceSprite();
            this.faceActor.pos = vec(0, 0);
        } else {
            this.updateFaceSprite();
        }
    }

    private _enraged: boolean = false;
    public get enraged() {
        return this._enraged;
    }
    public set enraged(inEnraged: boolean) {
        if (this._enraged == inEnraged) {
            return;
        }
        // should we block trying to de-enrage someone? that should only be possible by being killed...

        if (inEnraged) {
            this._neighborSelected = false;
        }

        this._enraged = inEnraged;
        this.updateFaceSprite();
    }

    public bodyActor: Actor;
    public faceActor: Actor;

    private sprites: EnemySprites = {};

    private animDeltaMs: number = 0;
    private lastAnimTick: number = 0;
    private animFrame: number = 0;

    constructor(config?: EnemyCharacterArgs) {
        super(config);

        this.transform.z = 10;

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

        this.sprites.enraged = ImageResources.enemyFaces.angry.toSprite();
        this.sprites.enraged.width = this.faceActor.width;
        this.sprites.enraged.height = this.faceActor.height;

        this.faceActor.graphics.use(this.sprites.regular);
    }

    private updateFaceSprite() {
        if (this.selected) {
            this.faceActor.graphics.use(this.sprites.dead!);
        } else if (this.enraged) {
            this.faceActor.graphics.use(this.sprites.enraged!);
        } else if (this.hovered || this.neighborSelected) {
            this.faceActor.graphics.use(this.sprites.surprised!);
        } else {
            this.faceActor.graphics.use(this.sprites.regular!);
        }
    }

    public onPostUpdate(_engine: Engine, _delta: number): void {
        if (this.isKilled()) {
            return;
        }

        let pathTail = this.gameScene.player!.pathTail;
        if (pathTail.occupant instanceof Exit) {
            if (this.gameScene.player!.path.length > 1) {
                pathTail = this.gameScene.player!.path[this.gameScene.player!.path.length - 2];
            }
        }
        if (pathTail.occupant instanceof PlayerCharacter || (pathTail.occupant as EnemyCharacter)?.enemyType === this.enemyType) {
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
                if (this.hovered || this.neighborSelected) {
                    this.faceActor.graphics.use(this.sprites.surprised!);
                }

                this.faceActor.pos = vec(0, 0);
            } else {
                if (this.hovered || this.neighborSelected) {
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

    public pointerdown() {
        this.selected = !this.selected;

        this.updateNeighborSelected();
    }

    public updateNeighborSelected() {
        for (const c of this.cell.getNeighbors()) {
            let e = c.occupant as EnemyCharacter;
            if (!(e instanceof EnemyCharacter)) {
                continue;
            }

            e.notifyNeighborSelected();
        }
    }

    protected notifyNeighborSelected() {
        if (this.enraged) {
            return;
        }

        var neighbors = this.cell.getNeighbors();
        let numSelected = 0;
        for (const e of neighbors.map(c => c.occupant as EnemyCharacter)) {
            if (!(e instanceof EnemyCharacter) || e.isKilled()) {
                continue;
            }

            if (e.selected) {
                numSelected++;
            }
        }

        this._neighborSelected = numSelected > 0;
        this.updateFaceSprite();
    }

    onPreKill(_scene: Scene): void {
        spawnDieEffect(this.pos, _scene);
    }

    onPostKill(_scene: Scene): void {
        this.cell.occupant = undefined;
    }

    canHover(pathTail: Cell): boolean {
        if (this.selected) {
            return true;
        }

        const pathTailOccupant = pathTail.occupant as EnemyCharacter | PlayerCharacter;
        const pathTailEnemyType = (pathTailOccupant as EnemyCharacter)?.enemyType;
        const occupantEnemyType = this.enemyType;
        const occupantSameTypeAsPathTail = (pathTailOccupant instanceof PlayerCharacter) || pathTailEnemyType === occupantEnemyType;
        return occupantSameTypeAsPathTail;
    }
}
