import { TiledResource } from "@excaliburjs/plugin-tiled";
import { Engine, SceneActivationContext } from "excalibur";
import { GameScene, GameSceneEvents } from "./game-scene";
import { html } from "../utilities/html";
import { PlayerEvents } from "../actors/player";

export class TutorialScene extends GameScene {
    private _tutorialPhase = -1;

    private readonly _tutorialSteps = [
        'Starting at the 💣, select a chain of like-colored adjacent enemies, then press Go to attack.',
        'Each enemy is worth one point. Once you reach the target score shown above, the exit door will open.',
        "Uh oh, an enemy is angry! Attack or avoid angry enemies. If you end your chain next to an angry enemy, you lose a heart. Lose all your hearts and it's game over!",
    ];

    private readonly _tutorialExitOpenMessage = "The exit is open! Move onto the exit to finish the level!"

    private _tutorialElement: HTMLElement;

    constructor(map: TiledResource) {
        super(map);

        this._tutorialElement = document.getElementById('tutorial')!;
    }

    onInitialize(engine: Engine): void {
        super.onInitialize(engine);

        this.goNextTutorialPhase();

        document.addEventListener('click', () => this.onClick());
        engine.input.pointers.primary.on('down', () => this.onClick());

        this.player!.on(PlayerEvents.NextTurnStarted, () => this.goNextTutorialPhase());

        this.events.once(GameSceneEvents.TargetScoreReached, () => this.notifyDoorOpen());
    }

    onDeactivate(context: SceneActivationContext): void {
        html.hideElement(this._tutorialElement);
    }

    private onClick() {
        if (html.elementIsVisible(this._tutorialElement)) {
            html.hideElement(this._tutorialElement);
        }
    }

    private goNextTutorialPhase() {
        // if we're showing a message that triggered out of band with turns ending, don't progress the phase
        if (html.elementIsVisible(this._tutorialElement)) {
            return;
        }

        this._tutorialPhase++;

        if (this._tutorialSteps.length > this._tutorialPhase) {
            this._tutorialElement.textContent = this._tutorialSteps[this._tutorialPhase];
            html.unhideElement(this._tutorialElement);
        }

        if (this._tutorialPhase === 2) {
            this.tryEnrageEnemies(1, 1, 1);
        }
    }

    private notifyDoorOpen() {
        this._tutorialElement.textContent = this._tutorialExitOpenMessage;
        html.unhideElement(this._tutorialElement);
    }
}
