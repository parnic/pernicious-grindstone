import { Sound } from "excalibur";
import { SfxResources } from "../resource";
import { shuffle } from "./array";
import { rand } from "./math";

export class Audio {
    private static bgmOrder: number[] = [];
    private static currBgmOrderIdx = 0;

    private static get currBgmIdx(): number {
        return this.bgmOrder[this.currBgmOrderIdx % this.bgmOrder.length];
    }

    private static readonly MusicVolume = 0.6;
    private static readonly EnemyImpactSfxVolume = 0.5;
    private static readonly ImpactSfxVolume = 1.0;
    private static readonly ExitSfxVolume = 0.4;
    private static readonly SelectedSfxVolume = 0.4;
    private static readonly EnemyEnragedSfxVolume = 0.4;
    private static readonly ExitOpenSfxVolume = 1.0;
    private static readonly GemPickupSfxVolume = 1.0;

    private static _rangeVolume: HTMLInputElement;

    static _masterVolumeMultiplier = 1.0;
    static get MasterVolumeMultiplier() {
        return this._masterVolumeMultiplier;
    }
    static set MasterVolumeMultiplier(_volume: number) {
        this._masterVolumeMultiplier = _volume;
        SfxResources.bgm[this.currBgmIdx].volume = this.MusicVolume * this.MasterVolumeMultiplier;
    }

    static init() {
        for (let i = 0; i < SfxResources.bgm.length; i++) {
            this.bgmOrder.push(i);
        }

        shuffle(this.bgmOrder);

        this._rangeVolume = (document.getElementById('volume-slider') as HTMLInputElement)!;
        let vol = localStorage.getItem('volume');
        if (vol) {
            this._rangeVolume.value = vol;
            this.MasterVolumeMultiplier = parseInt(vol) / 100;
        }

        for (const bgm of SfxResources.bgm) {
            bgm.on('playbackend', () => this.playMusic());
        }
    }

    private static playSound(snd: Sound, volume: number) {
        snd.volume = volume * this.MasterVolumeMultiplier;
        snd.play();
    }

    static playMusic() {
        this.currBgmOrderIdx++;
        this.playSound(SfxResources.bgm[this.currBgmIdx], this.MusicVolume);
    }

    static playImpactSfx() {
        this.playSound(SfxResources.impacts[rand.integer(0, SfxResources.impacts.length - 1)], this.ImpactSfxVolume);
    }

    static playEnemyImpactSfx() {
        this.playSound(SfxResources.enemyImpacts[rand.integer(0, SfxResources.enemyImpacts.length - 1)], this.EnemyImpactSfxVolume);
    }

    static playExitSfx() {
        this.playSound(SfxResources.reachedExit[rand.integer(0, SfxResources.reachedExit.length - 1)], this.ExitSfxVolume);
    }

    static playSelectedSfx(num: number) {
        this.playSound(SfxResources.cellSelected[Math.min(num, SfxResources.cellSelected.length - 1)], this.SelectedSfxVolume);
    }

    static playEnemyEnragedSfx() {
        this.playSound(SfxResources.enemyEnraged[rand.integer(0, SfxResources.enemyEnraged.length - 1)], this.EnemyEnragedSfxVolume);
    }

    static playExitOpenedSfx() {
        this.playSound(SfxResources.exitOpen[rand.integer(0, SfxResources.exitOpen.length - 1)], this.ExitOpenSfxVolume);
    }

    static playGemPickupSfx() {
        this.playSound(SfxResources.gemPickup[rand.integer(0, SfxResources.gemPickup.length - 1)], this.GemPickupSfxVolume);
    }
}
