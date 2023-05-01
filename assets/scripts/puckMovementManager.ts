import { _decorator, Component, Node, Collider2D, RigidBody2D, Vec2, Vec3, tween, CircleCollider2D, math } from 'cc';
import { collisionManager } from './collisionManager';
import { NetworkManager } from './NetworkManager';
import { strikerMovementManager } from './strikerMovementManager';
const { ccclass, property } = _decorator;

@ccclass('puckMovementManager')
export class puckMovementManager extends Component {

    private _networkManager: NetworkManager | null = null;

    @property({ type: Node })
    bounderies: Node | null = null;

    hitterName: string = "none";
    vel: Vec2 = new Vec2(0, 0);
    isPuckScoringActive = true;
    velocityOfNode = new Vec2(0, 0);
    bounderiesPoints = {};

    onLoad() {
        this.bounderiesPoints["LEFT"] = this.bounderies.getChildByName("LEFT").getWorldPosition();
        this.bounderiesPoints["RIGHT"] = this.bounderies.getChildByName("RIGHT").getWorldPosition();
        this.bounderiesPoints["UP"] = this.bounderies.getChildByName("UP").getWorldPosition();
        this.bounderiesPoints["DOWN"] = this.bounderies.getChildByName("DOWN").getWorldPosition();
    }
    start() { }


    update(deltaTime: number) {
        // Restricting the puck to go out of board
        this.vel = this.node.getComponent(RigidBody2D).linearVelocity;
        let modifiedPosX = math.clamp(this.node.getWorldPosition().x, this.bounderiesPoints["LEFT"].x, this.bounderiesPoints["RIGHT"].x);
        let modifiedPosY = math.clamp(this.node.getWorldPosition().y, this.bounderiesPoints["DOWN"].y, this.bounderiesPoints["UP"].y);
        this.node.setWorldPosition(modifiedPosX, modifiedPosY, 0);

        if (this._networkManager != null) {
            this._networkManager.sendPuckStateToServer(this.node.getPosition(), this.node.getComponent(RigidBody2D).linearVelocity, this.node.getComponent(RigidBody2D).angularVelocity);
        }

    }

    /**
     * 
     * @param otherCollider
     * @description this function set the velocity of puck on collision 
     */
    setVelOfPuck(otherCollider: Collider2D) {
        let othCollVelocity = otherCollider.node.getComponent(strikerMovementManager).getVelocityOfStk();
        let newVelocity = othCollVelocity; // (Higher will be the velocity of striker, the fastest the puck will move)
        let oldVelocityOfPuck = this.node.getComponent(RigidBody2D).linearVelocity;
        let newModVelocity = new Vec2(oldVelocityOfPuck.x + newVelocity.x, oldVelocityOfPuck.y + newVelocity.y);


        // this._networkManager.sendPuckStateToServer(this.node.getPosition(), newModVelocity, this.node.getComponent(RigidBody2D).angularVelocity);
        this.node.getComponent(RigidBody2D).linearVelocity = newModVelocity;
    }

    repositionPuck(goalCollider: Collider2D, pos: Vec3 = new Vec3(0, 0, 0)) {
        this.node.getComponent(RigidBody2D).linearVelocity = new Vec2(0, 0);
        setTimeout(() => {
            this.node.getComponent(RigidBody2D).angularVelocity = 0;
            this.node.setPosition(pos);
        });
        goalCollider.enabled = true;
    }


    // Multiplayer Code
    setNetworkManager(owner: NetworkManager) { this._networkManager = owner; }
    setPuckPos(finalPos: Vec3) { this.node.setPosition(-finalPos.x, -finalPos.y, 0) }
    syncPuckStateWithServer(position: Vec3, velocity: Vec2, angularVelocity: number) {
        this.node.getComponent(RigidBody2D).angularVelocity = angularVelocity;
        let x = (this.node.getPosition().x + position.x) / 2;
        let y = (this.node.getPosition().y + position.y) / 2;
        this.node.setPosition(x, y, 0);
        // this.node.setPosition(position);
        this.node.getComponent(RigidBody2D).linearVelocity = velocity;
    }

}

