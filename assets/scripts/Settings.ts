import { _decorator, Component, Input, Node, Slider, sys, Toggle, Vec3, UITransform } from 'cc';
import soundManagerInstance from './soundManager';
const { ccclass, property } = _decorator;

@ccclass('Settings')
export class Settings extends Component {

    @property({ type: Node })
    close: Node = null;

    @property({ type: Node })
    volumeHandle: Node = null;

    @property({ type: Node })
    volumeSlider: Node = null;

    @property({ type: Node })
    volumeColor: Node = null;

    @property({ type: Node })
    MusicOn: Node = null;
    @property({ type: Node })
    MusicOff: Node = null;

    @property({ type: Node })
    SoundOn: Node = null;

    @property({ type: Node })
    SoundOff: Node = null;

    userSettings = {
        volume: null,
        music: null,
        sound: null,
        canPlayMusic: null,
        canPlaySound: null
    };
    protected onLoad(): void {
        let prevSettings = sys.localStorage.getItem("userSettings");
        this.userSettings = { ...JSON.parse(prevSettings) };
        this.prevSettingsController();
        this.close.on(Input.EventType.TOUCH_START, () => {
            this.node.destroy();
        })

        this.volumeSlider!.on("slide", this.volumeController, this);
        this.MusicOn.on(Input.EventType.TOUCH_START, this.musicController, this);
        this.MusicOff.on(Input.EventType.TOUCH_START, this.musicController, this);
        this.SoundOff.on(Input.EventType.TOUCH_START, this.soundController, this);
        this.SoundOn.on(Input.EventType.TOUCH_START, this.soundController, this);
    }

    volumeController = () => {
        let progress = this.volumeSlider.getComponent(Slider).progress;
        this.volumeColor.setScale(new Vec3(progress, 1, 0));
        this.userSettings.volume = progress;
        sys.localStorage.setItem("userSettings", JSON.stringify(this.userSettings));
        soundManagerInstance.musicVolumeController(progress);
    }



    prevSettingsController() {
        if (this.userSettings.volume != null) {
            this.volumeSlider.getComponent(Slider).progress = this.userSettings.volume;

            this.volumeColor.setScale(new Vec3(this.userSettings.volume, 1, 0));
        }
        if (this.userSettings.music == true) { this.MusicOn.getComponent(Toggle).isChecked = true; }
        else if (this.userSettings.music == false) {
            this.MusicOff.getComponent(Toggle).isChecked = true;
        }

        if (this.userSettings.sound == true) { this.SoundOn.getComponent(Toggle).isChecked = true; }
        else if (this.userSettings.sound == false) {
            this.SoundOff.getComponent(Toggle).isChecked = true;
        }
    }

    musicController() {
        let on = this.MusicOn.getComponent(Toggle).isChecked;
        if (!on) {
            soundManagerInstance.CanPlayMusic = true;
            this.userSettings.canPlayMusic = true;
            this.userSettings.music = true;
        } else {
            soundManagerInstance.CanPlayMusic = false;

            this.userSettings.music = false;
            this.userSettings.canPlayMusic = false;
        }
        sys.localStorage.setItem("userSettings", JSON.stringify(this.userSettings));
    }

    soundController() {
        let on = this.SoundOn.getComponent(Toggle).isChecked;
        if (!on) {
            soundManagerInstance.CanPlaySound = true;
            this.userSettings.canPlaySound = true;
            this.userSettings.sound = true;
        } else {
            soundManagerInstance.CanPlaySound = false;
            this.userSettings.canPlaySound = false;
            this.userSettings.sound = false;
        }
        sys.localStorage.setItem("userSettings", JSON.stringify(this.userSettings));
    }

    start() {

    }

    update(deltaTime: number) {
        // console.log(this.volumeHandle.getPosition().x);
    }
}

