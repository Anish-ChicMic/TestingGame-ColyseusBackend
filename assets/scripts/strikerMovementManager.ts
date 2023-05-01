import { _decorator, Component, Node, Input, Vec3, UITransform, Vec2, RigidBody2D, RigidBody, Contact2DType, Collider2D, CircleCollider2D, math } from 'cc';
import { NetworkManager } from './NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('strikerMovementManager')
export class strikerMovementManager extends Component {

    private _networkManager: NetworkManager | null = null;

    @property({ type: Node })
    board: Node = null;
    @property({ type: Node })
    puck: Node = null;
    @property({ type: Node })
    bounderies: Node = null;

    strikerStartPosition = null;
    strikerPosition = null;

    velocityQue: Vec2[] = []; // storing the last five striker positions values

    bounderiesPoints = {};

    onLoad() {

        this.strikerStartPosition = this.node.getPosition();
        this.node.on(Input.EventType.TOUCH_MOVE, this.strikerMovement, this);
        this.node.on(Input.EventType.TOUCH_START, this.strikerTouchStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.emptyQueue, this);

        this.bounderiesPoints["UP"] = this.bounderies.getChildByName("UP").getWorldPosition();
        this.bounderiesPoints["DOWN"] = this.bounderies.getChildByName("DOWN").getWorldPosition();
        this.bounderiesPoints["LEFT"] = this.bounderies.getChildByName("LEFT").getWorldPosition();
        this.bounderiesPoints["RIGHT"] = this.bounderies.getChildByName("RIGHT").getWorldPosition();

    }

    update() {
        // this._networkManager.sendStrikerStateToServer(this.node.getPosition(), this.velocityQue);
    }

    strikerTouchStart(touchEvent) { this.strikerPosition = this.node.getPosition(); }

    strikerMovement(touchMoveEvent) {

        // Checking how fast user is moving striker
        let currMovePoint = touchMoveEvent.touch._prevPoint;
        let pointData = new Vec2(currMovePoint.x, currMovePoint.y);

        if (this.velocityQue.length === 5) {
            this.velocityQue.shift();
            this.velocityQue.push(pointData);
        }
        else { this.velocityQue.push(pointData); }


        // Moving striker with mouse position
        let pointerPosition = touchMoveEvent.getUILocation();
        let boardPosition = this.board.getWorldPosition();

        // limiting strikers to cross board centre line (with board anchor point)
        let newPos = new Vec3(0, 0, 0);
        let boundPos = this.strikerBoundation(this.bounderiesPoints["UP"].y, this.bounderiesPoints["DOWN"].y, this.bounderiesPoints["LEFT"].x, this.bounderiesPoints["RIGHT"].x, pointerPosition);
        if (this.node.name == "StrikerTop" && boardPosition.y > boundPos.y - 95) {
            newPos = new Vec3(boundPos.x, boardPosition.y + 95, 0);
        }
        else if (this.node.name == "StrikerBottom" && boardPosition.y < boundPos.y + 95) {
            newPos = new Vec3(boundPos.x, boardPosition.y - 95, 0);
        }
        else { newPos = new Vec3(boundPos.x, boundPos.y, 0); }

        this.node.setWorldPosition(newPos);
        this.node.getComponent(RigidBody2D).linearVelocity = new Vec2(0, 0);


        // console.log(this.node.name);
        this._networkManager.sendStrikerStateToServer(this.node.getPosition(), this.velocityQue);

    }


    // Multiplayer Code
    setNetworkManager(owner: NetworkManager) {
        this._networkManager = owner;
    }
    setStrPos(finalPos: Vec3, velocityQue: Vec2[]) {
        this.velocityQue = velocityQue;
        // this.node.setPosition(finalPos.x, -finalPos.y, 0);
        this.node.setPosition(finalPos.x, finalPos.y, 0);
    }
    syncStrPositionWithServer(finalPos: Vec3, velocityQue: Vec2[]) {
        console.log("received velocity Quee: ", velocityQue);
        this.velocityQue = velocityQue;
        this.node.setPosition(finalPos.x, finalPos.y, 0);
    }




    /**
     * @description this function is used to add 0 values in queue
     */
    emptyQueue() { this.velocityQue.map((element) => { element = new Vec2(0, 0); }) }


    /**
    * 
    * @description this function gives how fastly player is moving his striker
    */
    getVelocityOfStk() {
        let lengthOfQue = this.velocityQue.length;
        if (lengthOfQue >= 2) {
            let initialPos = this.velocityQue[0]
            let finalPos = this.velocityQue[lengthOfQue - 1];
            let dx = finalPos.x - initialPos.x;
            let dy = finalPos.y - initialPos.y;
            return new Vec2(dx, dy);
        }
        else return new Vec2(0, 0);
    }


    repositionStriker() {
        setTimeout(() => {
            this.node.setPosition(this.strikerStartPosition);
        });
    }


    /**
     * @description this function is helping to restrict the striker to go out of the board
     * @param upPoint Upper boundry point
     * @param downPoint down boundry point
     * @param leftPoint left boundry point
     * @param rightPoint right boundry point
     * @param currMousePos mouse position
     */
    strikerBoundation(up: number, down: number, left: number, right: number, mousePos: Vec2): Vec3 {
        let newPos: Vec3 = new Vec3(math.clamp(mousePos.x, left, right), math.clamp(mousePos.y, down, up), 0);
        return newPos;
    }

}