import { Engine } from "excalibur";
import { Resources } from "./resource";
import { TiledResource } from "@excaliburjs/plugin-tiled";
import { TransitionScene } from "./scenes/transition-scene";
import { GameScene } from "./scenes/game-scene";

export class SceneData {
    name: string = ''
    map: TiledResource
    nextScene: string = ''

    constructor(_name: string, _map: TiledResource, _nextScene: string) {
        this.name = _name;
        this.map = _map;
        this.nextScene = _nextScene;
    }
}

export class SceneManager {
    static sceneList: SceneData[] = [
        {
            name: 'scene01',
            map: Resources.stage01,
            nextScene: 'scene02'
        },
        {
            name: 'scene02',
            map: Resources.stage02,
            nextScene: 'scene03'
        },
        {
            name: 'scene03',
            map: Resources.stage03,
            nextScene: ''
        },
    ];

    static getCurrentSceneData(engine: Engine): SceneData | undefined {
        let currentSceneDataIdx = this.sceneList.findIndex(s => s.name == engine.currentSceneName);
        if (currentSceneDataIdx == -1) {
            return undefined;
        }

        return this.sceneList[currentSceneDataIdx];
    }

    static getNextSceneData(engine: Engine) : SceneData | undefined {
        let currentSceneDataIdx = this.sceneList.findIndex(s => s.name == engine.currentSceneName);
        if (currentSceneDataIdx == -1) {
            throw Error(`cannot find scene data for current active scene ${engine.currentSceneName}`);
        }

        if (currentSceneDataIdx == this.sceneList.length - 1) {
            return undefined;
        }

        return this.sceneList[currentSceneDataIdx + 1];
    }

    static getFirstSceneData(): SceneData {
        return this.sceneList[0];
    }

    static async goToScene(nextSceneData: SceneData, engine: Engine, currentSceneData?: SceneData) {
        const t = new TransitionScene(nextSceneData);
        engine.addScene('transition', t);
        await engine.goToScene('transition');
        if (currentSceneData) {
            engine.removeScene(currentSceneData.name);
        }
        engine.addScene(nextSceneData.name, new GameScene(nextSceneData.map));
        await engine.goToScene(nextSceneData.name);
        engine.removeScene('transition');
    }

    static async goToNextScene(engine: Engine) {
        const curr = this.getCurrentSceneData(engine);
        const next = this.getNextSceneData(engine);
        await this.goToScene(next!, engine, curr);
    }
}
