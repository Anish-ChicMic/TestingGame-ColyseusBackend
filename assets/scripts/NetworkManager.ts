import { _decorator, Component, Node, Vec3, Pool, Vec2, Collider2D, RigidBody2D, log, Label } from 'cc';
import { strikerMovementManager } from './strikerMovementManager';
import Colyseus from 'db://colyseus-sdk/colyseus.js';
import { puckMovementManager } from './puckMovementManager';
import { collisionManager } from './collisionManager';
import { login } from './login';

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
    @property({ type: Label })
    roomPlayerCoutn: Label | null = null;

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
            let userDATa = {
                // accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQW5pc2ggS3VtYXIiLCJlbWFpbCI6ImFuaXNoLjE5MDMua21yQGdtYWlsLmNvbSIsInVzZXJJRCI6ImFubmlpX180IiwiaWF0IjoxNjgzMTk1ODMzfQ._tJEDYuimlJXd7fpCf5JNBXYdin7se_O7VABv137iQA'
                accessToken: localStorage.getItem('token')
            }
            this.room = await this.client.joinOrCreate("my_room", userDATa);
            console.log("joined successfully!", this.client);
            console.log("user's sessionId:", this.room.sessionId, this.room);
            this.stateTopPlayer = this.room.state.playerInfo.topPlayer;
            this.statebottomPlayer = this.room.state.playerInfo.bottomPlayer;
            if (this.room.sessionId === this.stateTopPlayer) {
                this.strBottom.getComponent(Collider2D).enabled = false
            }
            else if (this.room.sessionId === this.statebottomPlayer) {
                this.strTop.getComponent(Collider2D).enabled = false
            }

            this.room.onMessage("GetToken", (data) => {
                console.log("GetToken: ", data);
            });
            this.room.onMessage("SomeoneJoinedOrLeaved", (data) => {
                console.log("someone Leaved the room: ", data)
                this.roomPlayerCoutn.string = data.playerCnt;
            });


            this.room.state.players.onAdd = (player, key) => {
                console.log(player, "has been added at", key);

                this.stateTopPlayer = this.room.state.playerInfo.topPlayer;
                this.statebottomPlayer = this.room.state.playerInfo.bottomPlayer;


                player.onChange = (changes) => {
                    console.log("Something has changes!");
                    let data = { position: new Vec3(), speedQueue: [] }
                    console.log("Player: ", player);

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

                    // console.log("Data got: ", data);
                    // Problem Here ^^^ Not properlly moving strikers
                    if (this.room.sessionId === this.stateTopPlayer) {
                        console.log("this is top player, bottom needs to change!");
                        this.strBottom.getComponent(strikerMovementManager).syncStrPositionWithServer(data.position, data.speedQueue);
                    }
                    else if (this.room.sessionId === this.statebottomPlayer) {
                        console.log("this is bot player, top needs to change!");
                        this.strTop.getComponent(strikerMovementManager).syncStrPositionWithServer(data.position, data.speedQueue);
                    }

                }


                // force "onChange" to be called immediatelly
                player.triggerAll();
            };



            // *******************************************************************************

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
                    // console.log("Received Puck changes from::: ", + puckDataReceivedFrom);
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
                    // console.log("Received SpeedQueue::: ", serverPuckState["angularVel"]);
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
        positions.x = positions.x * 10; positions.y = positions.y * 10;
        this.room!.send("strikerMoved", { positions, speedQueue });
    }
    public sendPuckStateToServer(position: Vec3, velocity: Vec2, angularVelocity: number) {
        this.room!.send("PuckState", { position, velocity, angularVelocity });
    }




}