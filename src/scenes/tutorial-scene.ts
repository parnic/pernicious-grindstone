import { TiledResource } from "@excaliburjs/plugin-tiled";
import { SceneActivationContext } from "excalibur";
import { GameScene, GameSceneEvents } from "./game-scene";
import { html } from "../utilities/html";
import { PlayerEvents } from "../actors/player";

export type TutorialSceneConfigArgs = {
    showTutorial?: boolean;
}

export class TutorialScene extends GameScene {
    private _tutorialPhase = -1;

    private readonly _tutorialSteps = [
        'Starting at the 💣, build a chain of like-colored adjacent enemies, then press Go to attack.',
        'Each enemy is worth one point. Once you reach the target score shown above, the exit door will open.',
        "Uh oh, an enemy is angry! Attack or avoid angry enemies. If you end your chain next to an angry enemy, you lose a heart. Lose all your hearts and it's game over!",
    ];

    private readonly _tutorialExitOpenMessage = "The exit is open! Move onto the exit to finish the level!"

    private readonly _seenTutorialKey = 'seenTutorial';

    private _tutorialElement: HTMLElement;
    private _showTutorial: boolean = true;

    private _onClickHandler = () => this.onClick();

    constructor(map: TiledResource, config?: TutorialSceneConfigArgs) {
        super(map);

        this._tutorialElement = document.getElementById('tutorial')!;

        if (config?.showTutorial !== undefined) {
            this._showTutorial = config.showTutorial;
        }
        if (localStorage.getItem(this._seenTutorialKey)) {
            this._showTutorial = false;
        }
    }

    onActivate(context: SceneActivationContext<unknown>): void {
        super.onActivate(context);

        if (!this._showTutorial) {
            return;
        }

        document.addEventListener('click', this._onClickHandler);
        this.engine.input.pointers.primary.on('down', this._onClickHandler);

        this.player!.on(PlayerEvents.NextTurnStarted, () => this.goNextTutorialPhase());
        this.events.once(GameSceneEvents.TargetScoreReached, () => this.notifyDoorOpen());

        this.goNextTutorialPhase();
    }

    onDeactivate(context: SceneActivationContext): void {
        super.onDeactivate(context);

        document.removeEventListener('click', this._onClickHandler);
        html.hideElement(this._tutorialElement);
        localStorage.setItem(this._seenTutorialKey, 'true');
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

    protected tryEnrageEnemies(numToEnrage: number, enragedChanceMin: number, enragedChanceMax: number): void {
        if (this._showTutorial && this._tutorialPhase < 2) {
            return;
        }

        super.tryEnrageEnemies(numToEnrage, enragedChanceMin, enragedChanceMax);
    }

    private notifyDoorOpen() {
        this._tutorialElement.textContent = this._tutorialExitOpenMessage;
        html.unhideElement(this._tutorialElement);
    }
}
