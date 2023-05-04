import { _decorator, Component, director, Input, input, instantiate, Node, Prefab, Sprite, EditBox, Label } from 'cc';
import resourceManagerInstance from './resourceManager';
import soundManagerInstance from './soundManager';
const { ccclass, property } = _decorator;

@ccclass('login')
export class login extends Component {

    public USER_DATA: any = null;

    @property({ type: Node })
    signUp: Node = null;

    @property({ type: Node })
    logIn: Node = null;

    @property({ type: Prefab })
    signUpPrefab: Prefab = null;

    @property({ type: Node })
    close: Node = null;

    @property({ type: Node })
    userNameEmail: Node | null = null;
    @property({ type: Node })
    password: Node | null = null;
    @property({ type: Node })
    ErrorBoard: Node | null = null;

    signUpNode = null;
    protected onLoad(): void {

        let audio = instantiate(resourceManagerInstance.getAudioPrefab());
        this.node.addChild(audio);
        this.signUp.on(Input.EventType.TOUCH_START, () => {
            // soundManagerInstance.playMusicClip(resourceManagerInstance.getMusicFile("button"), false);

            this.scheduleOnce(() => {
                // if (this.signUpNode == null) {
                //     this.signUpNode = instantiate(this.signUpPrefab);
                //     this.node.addChild(this.signUpNode);

                // } else {
                //     this.signUpNode.active = true;
                // }

                this.signUpNode = instantiate(this.signUpPrefab);
                this.node.getParent().addChild(this.signUpNode);
                this.node.destroy();
            }, 0.6);
        });

        this.logIn.on(Input.EventType.TOUCH_START, () => {
            if (this.validateData()) {
                // Login Auth. Here
                let data = {
                    userID: this.USER_DATA.userNameEmail,
                    password: this.USER_DATA.password
                }
                this.sendLoginRequest(data);
                // soundManagerInstance.playMusicClip(resourceManagerInstance.getMusicFile("button"), false);
                this.scheduleOnce(() => { this.node.active = false }, 0.6);
            }

        })

        this.close.on(Input.EventType.TOUCH_START, () => {
            this.node.destroy();
        })


    }

    start() {


    }

    update(deltaTime: number) {

    }



    validateData() {
        let userData = this.getUserData();

        if (this.isDataValid(userData)) {
            console.log("submit data!");
            this.USER_DATA = userData;
            return true;
        }
        else {
            console.log("Data is not valid!");
            return false;
        }


    }


    getUserData(): {} {
        console.log("Getting user Data");
        let userData = {};
        let userNameEmail = this.userNameEmail.getComponent(EditBox).string;
        let password = this.password.getComponent(EditBox).string;
        userData["userNameEmail"] = userNameEmail;
        userData["password"] = password;
        return userData;
    }


    isDataValid(data: {}) {
        const regEx = {
            nameFeild: /^[A-Za-z. ]{3,30}$/,
            // userName: /^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/,
            userName: /^[A-Za-z][A-Za-z0-9_]{7,29}$/,
            // email: /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/,
            email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/,
            telephone: /^\d{11}$/,
        }
        /*
            Username requirements:
            Username consists of alphanumeric characters (a-zA-Z0-9), lowercase, or uppercase.
            Username allowed of the dot (.), underscore (_), and hyphen (-).
            The dot (.), underscore (_), or hyphen (-) must not be the first or last character.
            The dot (.), underscore (_), or hyphen (-) does not appear consecutively, e.g., java..regex
            The number of characters must be between 5 to 20.
        */

        // Iterate through the object
        console.log(data);
        console.log(data);
        if (!regEx["userName"].test(data["userNameEmail"]) && !regEx["email"].test(data["userNameEmail"])) {
            this.ErrorBoard.getComponent(Label).string = "Name is not Valid! ❌"
            this.userNameEmail.getComponent(EditBox).placeholder = "Please correct your name! "
            console.log("Name not valid");
            return false;
        }
        else if (data["password"] === "") {
            this.ErrorBoard.getComponent(Label).string = "Password can't be empty! ❌"
            console.log("Password can't be empty! ❌");
            return false;
        }

        this.ErrorBoard.getComponent(Label).string = "All Done! ✅";
        console.log("All Done! ✅");
        return true;

    }

    sendLoginRequest(param: any) {
        let xhr = new XMLHttpRequest();
        let fullurl = 'http://localhost:3000/users/login';

        let readyStateChanged = () => {
            if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
                let response: string = xhr.responseText;
                console.log("Response: " + response);
                localStorage.setItem('token', `${response}`)
                // successCb(response);
            } else if (xhr.readyState === 4 && xhr.status >= 400 && xhr.status < 500) {
                let respone: string = xhr.responseText;
                console.log("Response: " + respone);
                // errorCb(respone);
            }
        };
        xhr.open("POST", fullurl);
        xhr.setRequestHeader("Content-Type", "application/json");

        // if (requireToken) xhr.setRequestHeader("Authorization", sessionStorage.getItem("token"));

        xhr.onreadystatechange = readyStateChanged;
        xhr.send(JSON.stringify(param));
    }

}

