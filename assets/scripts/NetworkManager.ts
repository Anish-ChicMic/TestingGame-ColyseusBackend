import { _decorator, Component, Node, Vec3, Pool, Vec2, Collider2D, RigidBody2D } from 'cc';
import { strikerMovementManager } from './strikerMovementManager';
import Colyseus from 'db://colyseus-sdk/colyseus.js';
import { puckMovementManager } from './puckMovementManager';
import { collisionManager } from './collisionManager';

const { ccclass, property } = _decorator;


@ccclass('NetworkManager')
export class NetworkManager extends Component {
    @property hostname = "192.180.0.107";
    @property port = 2567;
    @property useSSL = false;

    client!: Colyseus.Client;
    room!: Colyseus.Room;


    @property({ type: Node })
    strTop: Node | null = null;
    @property({ type: Node })
    strBottom: Node | null = null;
    @property({ type: Node })
    puck: Node | null = null;

    stateTopPlayer: string
    statebottomPlayer: string;

    onLoad() {
        this.strTop.getComponent(strikerMovementManager).setNetworkManager(this);
        this.strBottom.getComponent(strikerMovementManager).setNetworkManager(this);
        this.puck.getComponent(puckMovementManager).setNetworkManager(this);
    }

    start() {
        // Instantiate Colyseus Client
        // connects into (ws|wss)://hostname[:port]
        this.client = new Colyseus.Client(`${this.useSSL ? "wss" : "ws"}://${this.hostname}${([443, 80].includes(this.port) || this.useSSL) ? "" : `:${this.port}`}`);

        // Connect into the room
        this.connect();
    }

    async connect() {
        try {
            this.room = await this.client.joinOrCreate("my_room");
            console.log("joined successfully!");
            console.log("user's sessionId:", this.room.sessionId);

            this.stateTopPlayer = this.room.state.playerInfo.topPlayer;
            this.statebottomPlayer = this.room.state.playerInfo.bottomPlayer;
            if (this.room.sessionId === this.stateTopPlayer) {
                // this.strBottom.getComponent(RigidBody2D).enabled = false
                this.strBottom.getComponent(Collider2D).enabled = false
            }
            else if (this.room.sessionId === this.statebottomPlayer) {
                // this.strTop.getComponent(RigidBody2D).enabled = false
                this.strTop.getComponent(Collider2D).enabled = false
            }

            this.room.state.playerBottom.onChange = (changes) => {
                // console.log("Received Bottom Change", changes);
                this.stateTopPlayer = this.room.state.playerInfo.topPlayer;
                this.statebottomPlayer = this.room.state.playerInfo.bottomPlayer;
                // console.log("players Top, bot::::", this.stateTopPlayer, this.statebottomPlayer)
                // console.log("IDS::::", this.room.sessionId === this.stateTopPlayer);
                if (this.room.sessionId === this.stateTopPlayer) {
                    let data = {
                        position: this.strBottom.getPosition(),
                        speedQueue: []
                    }

                    changes.forEach(change => {
                        const { field, value } = change;
                        switch (field) {
                            case 'x': {
                                data.position.x = value / 10;
                                break;
                            }
                            case 'y': {
                                data.position.y = value / 10;
                                break;
                            }
                            case 'speedQueue': {
                                let statespeedQueue = value;
                                statespeedQueue.forEach(point => {
                                    data.speedQueue.push(new Vec2(point.x, point.y));
                                });
                                break;
                            }
                        }
                    });

                    this.strBottom.getComponent(strikerMovementManager).syncStrPositionWithServer(data.position, data.speedQueue);
                }
            };


            this.room.state.playerTop.onChange = (changes) => {
                // console.log("Received Top Change", changes);
                this.stateTopPlayer = this.room.state.playerInfo.topPlayer;
                this.statebottomPlayer = this.room.state.playerInfo.bottomPlayer;
                // console.log("players Top, bot::::", this.stateTopPlayer, this.statebottomPlayer)
                // console.log("IDS::::", this.room.sessionId === this.statebottomPlayer);
                if (this.room.sessionId === this.statebottomPlayer) {
                    let data = {
                        position: this.strTop.getPosition(),
                        speedQueue: []
                    }

                    changes.forEach(change => {
                        const { field, value } = change;
                        switch (field) {
                            case 'x': {
                                data.position.x = value / 10;
                                break;
                            }
                            case 'y': {
                                data.position.y = value / 10;
                                break;
                            }
                            case 'speedQueue': {
                                let statespeedQueue = value;
                                statespeedQueue.forEach(point => {
                                    data.speedQueue.push(new Vec2(point.x, point.y));
                                });
                            }
                        }
                    });

                    this.strTop.getComponent(strikerMovementManager).syncStrPositionWithServer(data.position, data.speedQueue);
                }
            };




            this.room.state.PuckState.onChange = (changes) => {
                // if (this.stateTopPlayer === this.room.sessionId) {
                //     this.strBottom.getComponent(RigidBody2D).enabled = false;
                //     this.strBottom.getComponent(Collider2D).enabled = false;
                // }
                // else if (this.statebottomPlayer === this.room.sessionId) {
                //     this.strTop.getComponent(RigidBody2D).enabled = false;
                //     this.strTop.getComponent(Collider2D).enabled = false;
                // }

                let puckDataReceivedFrom: string;
                changes.forEach(change => {
                    const { field, value } = change;
                    switch (field) {
                        case 'client': {
                            puckDataReceivedFrom = value;
                            break;
                        }
                    }
                });

                if (puckDataReceivedFrom != this.room.sessionId) {

                    // console.log("Puck OnChange============= ", changes);
                    console.log("Received Puck changes from::: ", + puckDataReceivedFrom);
                    let serverPuckState = {
                        "position": this.puck.getPosition(),
                        "velocity": this.puck.getComponent(RigidBody2D).linearVelocity,
                        "angularVel": this.puck.getComponent(RigidBody2D).angularVelocity
                    };

                    changes.forEach(change => {
                        const { field, value } = change;
                        switch (field) {
                            case 'x': {
                                serverPuckState.position.x = value / 10;
                                break;
                            }
                            case 'y': {
                                serverPuckState.position.y = value / 10;
                                break;
                            }
                            case 'angularVelocity': {
                                serverPuckState.angularVel = value / 10;
                                break;
                            }
                            case 'velocityX': {
                                serverPuckState.velocity.x = value / 10;
                                break;
                            }
                            case 'velocityY': {
                                serverPuckState.velocity.y = value / 10;
                                break;
                            }

                        }
                    });
                    console.log("Received SpeedQueue::: ", serverPuckState["angularVel"]);
                    this.puck.getComponent(puckMovementManager).syncPuckStateWithServer(serverPuckState["position"], serverPuckState["velocity"], serverPuckState["angularVel"])
                }
            }




            this.room.onLeave((code) => {
                console.log("onLeave:", code);
            });

        }
        catch (e) { console.error(e); }

    }






    public sendStrikerStateToServer(positions: Vec3, speedQueue: Vec2[]) {
        // console.log("Sending Striker Move Data to Server.....");
        // console.log("Sender's session Id:", this.room.sessionId);
        console.log("sending speedQueue::: ", speedQueue);
        positions.x = positions.x * 10; positions.y = positions.y * 10;
        // speedQueue.forEach(point => {
        //     point.x = point.x * 100;
        //     point.y = point.y * 100;
        // });
        console.log(positions);
        this.room!.send("strikerMoved", { positions, speedQueue });
    }
    public sendPuckStateToServer(position: Vec3, velocity: Vec2, angularVelocity: number) {
        // console.log("Sending Puck State To Server......");
        // position.x = position.x * 10; position.y = position.y * 10;
        // console.log(position);
        // angularVelocity.for
        this.room!.send("PuckState", { position, velocity, angularVelocity });
    }


}