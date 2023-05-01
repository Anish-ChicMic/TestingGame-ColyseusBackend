import { _decorator, Component, director, Input, instantiate, Node, Prefab, AudioSource, sys, Vec3, Slider } from 'cc';

import resourceManagerInstance from './resourceManager';
import soundManagerInstance from './soundManager';
// import { login } from './login';
const { ccclass, property } = _decorator;

@ccclass('startScreen')
export class startScreen extends Component {

    @property({ type: Node })
    Multiplayer: Node = null;

    @property({ type: Node })
    SinglePlayer: Node = null;

    @property({ type: Prefab })
    LogIn: Prefab = null;

    @property({ type: Node })
    Settings: Node = null;

    @property({ type: Prefab })
    SettingPrefab: Prefab = null;

    @property({ type: Prefab })
    LoadingScreen: Prefab = null;

    audioInstance = null;



    isLogInAppear = false;
    onLoad(): void {


        if (!this.isLogInAppear) { }

        this.node.addChild(instantiate(this.LoadingScreen));
        this.scheduleOnce(() => {

            this.node.addChild(instantiate(this.LogIn))
            let audioPrefab = resourceManagerInstance.getAudioPrefab();
            director.preloadScene("gamePlay");
            this.audioInstance = instantiate(audioPrefab);
            this.node.addChild(this.audioInstance);

            soundManagerInstance.playMusicClip(resourceManagerInstance.getMusicFile("Bgkd2"), true);
            if (sys.localStorage.getItem("userSettings")) {
                soundManagerInstance.CanPlayMusic = JSON.parse(sys.localStorage.getItem("userSettings")).canPlayMusic;
            }

        }, 4);




        this.SinglePlayer.on(Input.EventType.TOUCH_START, () => {
            soundManagerInstance.playSoundEffect(resourceManagerInstance.getMusicFile("button"), false);
            if (sys.localStorage.getItem("userSettings")) {
                console.log("working ");
                soundManagerInstance.CanPlaySound = JSON.parse(sys.localStorage.getItem("userSettings")).canPlaySound;
            }
        })
        this.Multiplayer.on(Input.EventType.TOUCH_START, () => {

            soundManagerInstance.playSoundEffect(resourceManagerInstance.getMusicFile("button"), false);
            if (sys.localStorage.getItem("userSettings")) {
                soundManagerInstance.CanPlaySound = JSON.parse(sys.localStorage.getItem("userSettings")).canPlaySound;
                console.log("working ");

            }

            this.scheduleOnce(() => { director.loadScene("gamePlay"); }, 0.7);


        })

        this.Settings.on(Input.EventType.TOUCH_START, () => {
            // this.node.addChild(instantiate(this.SettingPrefab));
            let settingPopUp = instantiate(this.SettingPrefab)
            settingPopUp.getChildByName("Slider").getChildByName("SliderColor").setScale(new Vec3(settingPopUp.getChildByName("Slider").getComponent(Slider).progress, 1, 0));
            this.node.addChild(settingPopUp);
        })

    }

    start() {

    }

    update(deltaTime: number) {

    }


}

