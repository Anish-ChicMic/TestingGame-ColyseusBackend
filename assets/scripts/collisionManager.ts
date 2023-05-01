import { _decorator, Component, Node, Collider2D, Contact2DType, Collider, instantiate, AudioSource, CircleCollider2D, Vec3, sys, RigidBody2D, Vec2 } from 'cc';
import { gamePlay } from './gamePlay';
import { puckMovementManager } from './puckMovementManager';
import { scoreManager } from './scoreManager';
import { strikerMovementManager } from './strikerMovementManager';
import soundManagerInstance from './soundManager';
import resourceManagerInstance from './resourceManager';
import { NetworkManager } from './NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('collisionManager')
export class collisionManager extends Component {
    private _networkManager: NetworkManager | null = null;

    @property({ type: Node })
    Board: Node = null;
    @property({ type: Node })
    strikerTop: Node = null
    @property({ type: Node })
    strikerBot: Node = null;

    audio: Node = null;


    thisNodeType: string = undefined;

    onLoad() {
        // let audioPrefab = resourceManagerInstance.getAudioPrefab();
        // this.audio = instantiate(audioPrefab);
        // let soundEffectNode = this.audio.children[1];
        // soundManagerInstance.initSoundEffectAS(soundEffectNode.getComponent(AudioSource));
    }

    start() {
        this.collsionDetection(this.node.getComponent(Collider2D));
    }

    update(deltaTime: number) { }


    // Multiplayer Code
    setNetworkManager(owner: NetworkManager) {
        this._networkManager = owner;
    }

    collsionDetection(nodeCollider: Collider2D) {

        if (nodeCollider) {
            nodeCollider.on(Contact2DType.BEGIN_CONTACT, (self: Collider2D, other: Collider2D) => {

                // Goal Colliders tag => {1,2}
                if (self.node.name === "Puck" && (other.tag === 1 || other.tag === 2)) {
                    // puckMovement();
                    self.node.getComponent(puckMovementManager).setVelOfPuck(other);
                    soundManagerInstance.playSoundEffect(resourceManagerInstance.getMusicFile("onHit"), false, 5);
                    // if (sys.localStorage.getItem("userSettings")) {
                    //     soundManagerInstance.CanPlaySound = JSON.parse(sys.localStorage.getItem("userSettings")).canPlaySound;
                    // }
                }
                else if (self.node.name === "Puck" && (other.tag === 3)) { // for Flags
                    // puckMovement();
                    console.log("flags ");
                    let preVel: Vec2 = self.node.getComponent(RigidBody2D).linearVelocity;
                    self.node.getComponent(RigidBody2D).linearVelocity = new Vec2(preVel.x + 40, preVel.y + 40);
                    soundManagerInstance.playSoundEffect(resourceManagerInstance.getMusicFile("onHit"), false, 5);
                    // if (sys.localStorage.getItem("userSettings")) {
                    //     soundManagerInstance.CanPlaySound = JSON.parse(sys.localStorage.getItem("userSettings")).canPlaySound;
                    // }
                }
                else if (self.node.name === "GoalBottom") {
                    console.log("goal");

                    // Repositing of Strikers and Puck
                    other.node.getComponent(puckMovementManager).repositionPuck(nodeCollider, new Vec3(0, -150, 0));
                    this.strikerTop.getComponent(strikerMovementManager).repositionStriker();
                    this.strikerBot.getComponent(strikerMovementManager).repositionStriker();

                    // update Goals
                    self.node.getComponent(scoreManager).setMyGoalFoul();
                    this.Board.getComponent(gamePlay).updateScore();

                }
                else if (self.node.name === "GoalTop") {
                    console.log("goal");

                    // Repositing of Strikers and Puck
                    other.node.getComponent(puckMovementManager).repositionPuck(nodeCollider, new Vec3(0, +150, 0));
                    this.strikerTop.getComponent(strikerMovementManager).repositionStriker();
                    this.strikerBot.getComponent(strikerMovementManager).repositionStriker();

                    // update Goals
                    self.node.getComponent(scoreManager).setMyGoalFoul();
                    this.Board.getComponent(gamePlay).updateScore();
                }

            })
        }


    }
}

