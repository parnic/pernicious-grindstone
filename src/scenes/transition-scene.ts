import { Scene } from "excalibur";
import { SceneData } from "../scene-manager";

export class TransitionScene extends Scene {
    private _sceneData: SceneData;

    constructor(sceneData: SceneData) {
        super();

        this._sceneData = sceneData;
    }
}
