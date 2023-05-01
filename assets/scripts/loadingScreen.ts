import { _decorator, Component, Node, Label, ProgressBar, director, sys } from 'cc';
import resourceManager from './resourceManager';
const { ccclass, property } = _decorator;

@ccclass('loadingScreen')
export class loadingScreen extends Component {
    @property({ type: Node })
    progressBar: Node = null;

    @property({ type: Label })
    progressPercentage: Label = null;

    protected onLoad(): void {
        this.schedule(this.incrementProgress, 1);
        resourceManager.loadMusicFiles("Audio");
        resourceManager.loadAudioPrefab("Prefabs/MusicNode");
    }

    incrementProgress() {

        this.progressBar.getComponent(ProgressBar).progress += 0.25;
        let progress = this.progressBar.getComponent(ProgressBar).progress;
        if (this.progressBar.getComponent(ProgressBar).progress >= 1) {
            this.unschedule(this.incrementProgress);
            director.resume();
            this.node.destroy();

        }
        this.progressPercentage.getComponent(Label).string = String(Math.floor(progress * 100)) + '%';
    }
    start() {

    }

    update(deltaTime: number) {

    }
}

