import { _decorator, Component, Node, Label, director, sys, instantiate, tween, Prefab, Input } from 'cc';
import resourceManagerInstance from './resourceManager';
import { scoreManager } from './scoreManager';
import soundManagerInstance from './soundManager';
const { ccclass, property } = _decorator;

@ccclass('gamePlay')
export class gamePlay extends Component {

    @property({ type: Node })
    goalTop: Node = null;

    @property({ type: Node })
    goalBottom: Node = null;

    @property({ type: Label })
    scoreTop: Node = null;
    @property({ type: Label })
    scoreBottom: Node = null;

    @property({ type: Node })
    leftFlag: Node = null

    @property({ type: Node })
    rightFlag: Node = null

    @property({ type: Node })
    pauseBtn: Node = null

    @property({ type: Prefab })
    gamePausePrefab: Prefab = null

    @property({ type: Prefab })
    gameOver: Prefab = null



    onLoad(): void {
        this.pauseBtn.on(Input.EventType.TOUCH_START, () => {
            director.pause();
            this.node.addChild(instantiate(this.gamePausePrefab))
        })
        // this.rightFlagRotate();
        // this.leftFlagRotate();


        let audio = instantiate(resourceManagerInstance.getAudioPrefab());
        this.node.addChild(audio);
        soundManagerInstance.playMusicClip(resourceManagerInstance.getMusicFile("BackGround"), false, 0.1);
        if (sys.localStorage.getItem("userSettings")) {
            soundManagerInstance.CanPlayMusic = JSON.parse(sys.localStorage.getItem("userSettings")).canPlayMusic;
        }
    }


    rightFlagRotate() {
        let tweenDuration: number = 0.4;
        let t1 = tween(this.rightFlag)
            .to(tweenDuration, { angle: -270 })

        let t2 = tween(this.rightFlag)
            .to(tweenDuration, { angle: -90 })

        tween(this.rightFlag).sequence(t1, t2).repeatForever().
            start();
    }
    leftFlagRotate() {
        let tweenDuration: number = 0.4;
        let t1 = tween(this.leftFlag)
            .to(tweenDuration, { angle: 90 })

        let t2 = tween(this.leftFlag)
            .to(tweenDuration, { angle: -90 })

        tween(this.leftFlag).sequence(t1, t2).repeatForever().
            start();
    }
    update(deltaTime: number) { }

    updateScore() {
        // scoreOfPlayerA = (GoalFouls Of Player B) * scorePoint

        let scoreTop = this.goalBottom.getComponent(scoreManager).getMyGoalFoul();
        let scoreBot = this.goalTop.getComponent(scoreManager).getMyGoalFoul();
        let userScore = {
            PlayerTop: scoreTop,
            PlayerBot: scoreBot,
        };
        sys.localStorage.setItem('Score', JSON.stringify(userScore));
        let score = JSON.parse(sys.localStorage.getItem("Score"));
        if (score.PlayerTop <= 7 && score.PlayerBot <= 7) {

            this.scoreTop.getComponent(Label).string = String(score.PlayerTop);
            this.scoreBottom.getComponent(Label).string = String(score.PlayerBot);


        } else {
            this.node.addChild(instantiate(this.gameOver));
        }
    }
}

