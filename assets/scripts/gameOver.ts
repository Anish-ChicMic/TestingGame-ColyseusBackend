import { _decorator, Component, director, easing, Input, instantiate, Label, Node, PostProcessStage, sys, tween, Vec3 } from 'cc';
import soundManagerInstance from './soundManager';
import resourceManagerInstance from './resourceManager';
const { ccclass, property } = _decorator;

@ccclass('gameOver')
export class gameOver extends Component {

    @property({ type: Node })
    rePlay: Node = null;

    @property({ type: Node })
    crown_Top: Node = null;

    @property({ type: Node })
    crown_Bottom: Node = null;

    @property({ type: Node })
    scoreTop: Node = null;


    @property({ type: Node })
    scoreBottom: Node = null;

    @property({ type: Node })
    gameOver: Node;

    protected onLoad(): void {
        let audioPrefab = resourceManagerInstance.getAudioPrefab();
        let audio = instantiate(audioPrefab);
        this.node.addChild(audio);
        this.crown_Top.active = false;
        this.crown_Bottom.active = false;
        director.preloadScene("gamePlay");
        this.rePlay.on(Input.EventType.TOUCH_START, () => {
            // soundManagerInstance.playOneShotSoundEffect(resourceManagerInstance.getMusicFile("button"), 1);
            // if (sys.localStorage.getItem("userSettings")) {
            //     soundManagerInstance.CanPlaySound = JSON.parse(sys.localStorage.getItem("userSettings")).canPlaySound;
            // }

            this.scheduleOnce(() => { director.resume(); this.node.destroy(); }, 0.7);


        });
        this.putCrown();
    }

    putCrown() {
        let score = JSON.parse(sys.localStorage.getItem("Score"));
        if (score.PlayerTop > score.PlayerBot) {
            this.crown_Top.active = true;
        } else {
            this.crown_Bottom.active = true;
        }
        this.scoreTop.getComponent(Label).string = `Score ${score.PlayerTop}`;
        this.scoreBottom.getComponent(Label).string = `Score ${score.PlayerBot}`;

    }

}

