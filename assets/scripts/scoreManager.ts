import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('scoreManager')
export class scoreManager extends Component {

    private noOfGoalFouls: number = 0; // No. of Goals this player's opponent has taken or this player's opponent's score

    @property({ type: Node })
    goalSprite: Node = null;

    resetGoal() {
        this.noOfGoalFouls = 0;
    }

    setMyGoalFoul() {
        this.noOfGoalFouls += 1;
        this.notifyGoal();
    }

    getMyGoalFoul = (): number => this.noOfGoalFouls

    notifyGoal() {
        tween(this.goalSprite).to(0.1, { scale: new Vec3(1.1, 1.1, 1) }).start();
        this.scheduleOnce(() => {
            tween(this.goalSprite).to(0.1, { scale: new Vec3(0, 0, 0) }).start();
        }, 1);
    }
}

