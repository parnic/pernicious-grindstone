import { SfxResources } from "../resource";
import { shuffle } from "./array";
import { rand } from "./math";

export class Audio {
    private static bgmOrder: number[] = [];
    private static currBgmIdx = 0;

    static MusicVolume = 0.6;
    static EnemyImpactSfxVolume = 0.5;
    static ImpactSfxVolume = 1.0;
    static ExitSfxVolume = 0.4;
    static SelectedSfxVolume = 0.4;
    static EnemyEnragedSfxVolume = 0.4;
    static ExitOpenSfxVolume = 1.0;

    static MasterVolumeMultiplier = 1.0;

    static init() {
        for (let i = 0; i < SfxResources.bgm.length; i++) {
            this.bgmOrder.push(i);
        }

        shuffle(this.bgmOrder);
    }

    static playMusic() {
        const idx = this.bgmOrder[this.currBgmIdx % this.bgmOrder.length];
        SfxResources.bgm[idx].once('playbackend', () => this.playMusic());
        SfxResources.bgm[idx].play(this.MusicVolume);
        this.currBgmIdx++;
    }

    static playImpactSfx() {
        SfxResources.impacts[rand.integer(0, SfxResources.impacts.length - 1)].play(this.ImpactSfxVolume * this.MasterVolumeMultiplier);
    }

    static playEnemyImpactSfx() {
        SfxResources.enemyImpacts[rand.integer(0, SfxResources.enemyImpacts.length - 1)].play(this.EnemyImpactSfxVolume * this.MasterVolumeMultiplier);
    }

    static playExitSfx() {
        SfxResources.reachedExit[rand.integer(0, SfxResources.reachedExit.length - 1)].play(this.ExitSfxVolume * this.MasterVolumeMultiplier);
    }

    static playSelectedSfx(num: number) {
        SfxResources.cellSelected[Math.min(num, SfxResources.cellSelected.length - 1)].play(this.SelectedSfxVolume * this.MasterVolumeMultiplier);
    }

    static playEnemyEnragedSfx() {
        SfxResources.enemyEnraged[rand.integer(0, SfxResources.enemyEnraged.length - 1)].play(this.EnemyEnragedSfxVolume * this.MasterVolumeMultiplier);
    }

    static playExitOpenedSfx() {
        SfxResources.exitOpen[rand.integer(0, SfxResources.exitOpen.length - 1)].play(this.ExitOpenSfxVolume * this.MasterVolumeMultiplier);
    }
}
