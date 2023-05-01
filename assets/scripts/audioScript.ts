import { _decorator, AudioSource, Component, Node, resources } from 'cc';
import soundManagerInstance from './soundManager';
const { ccclass, property } = _decorator;

@ccclass('audioScript')
export class audioScript extends Component {

    @property({ type: AudioSource })
    Music: AudioSource = null;

    @property({ type: AudioSource })
    soundEffect: AudioSource = null;

    onLoad(): void {

        soundManagerInstance.init(this.Music.getComponent(AudioSource));
        soundManagerInstance.initSoundEffectAS(this.soundEffect.getComponent(AudioSource));

    }


    start() {

    }

    update(deltaTime: number) {

    }
}