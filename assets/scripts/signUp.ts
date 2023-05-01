import { _decorator, Component, Input, Node, director, instantiate, Prefab, EditBox, Label } from 'cc';
import soundManagerInstance from './soundManager';
import resourceManagerInstance from './resourceManager';

const { ccclass, property } = _decorator;

@ccclass('signUp')
export class signUp extends Component {

    @property({ type: Node })
    signUp: Node = null;

    @property({ type: Prefab })
    logInPrefab: Prefab = null;

    @property({ type: Node })
    close: Node = null;


    @property({ type: Node })
    nameFeild: Node = null;
    @property({ type: Node })
    userName: Node | null = null;
    @property({ type: Node })
    password: Node | null = null;
    @property({ type: Node })
    cnfPassword: Node | null = null;
    @property({ type: Node })
    ErrorBoard: Node | null = null;

    onLoad(): void {
        //     let audio = instantiate(resourceManagerInstance.getAudioPrefab());
        //     this.node.addChild(audio);
    }

    start() {
        // this.nameFeild.getChildByName("ErrorBoard").active = false;
        this.signUp.on(Input.EventType.TOUCH_START, () => {
            // this.nameFeild.getChildByName("ErrorBoard").active = false;
            if (this.validateData()) {
                // soundManagerInstance.playMusicClip(resourceManagerInstance.getMusicFile("button"), false);
                this.scheduleOnce(() => { this.node.destroy() }, 0.7);
            }
        })

        this.close.on(Input.EventType.TOUCH_START, () => {
            this.node.destroy();
        })
    }

    update(deltaTime: number) {

    }



    validateData() {
        let userData = this.getUserData();

        if (this.isDataValid(userData)) {
            console.log("submit data!");
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

        let nameFeild = this.nameFeild.getComponent(EditBox).string;
        let userName = this.userName.getComponent(EditBox).string;
        let password = this.password.getComponent(EditBox).string;
        let cnfPassword = this.cnfPassword.getComponent(EditBox).string;

        userData["nameFeild"] = nameFeild
        userData["userName"] = userName;
        userData["password"] = password;
        userData["cnfPassword"] = cnfPassword;

        return userData;
    }

    isDataValid(data: {}) {
        const regEx = {
            nameFeild: /^[A-Za-z. ]{3,30}$/,
            userName: /^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/,
            email: /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/,
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
        if (!regEx["nameFeild"].test(data["nameFeild"])) {
            this.ErrorBoard.getComponent(Label).string = "Name is not Valid! ❌"
            this.nameFeild.getComponent(EditBox).placeholder = "Please correct your name! "
            console.log("Name not valid");
            return false;
        }
        else if (!regEx["userName"].test(data["userName"])) {
            this.ErrorBoard.getComponent(Label).string = "User Name is not Valid! ❌"
            console.log("userName not valid");
            return false;
        }
        else if (!regEx["password"].test(data["password"])) {
            this.ErrorBoard.getComponent(Label).string = "Password is not Valid! ❌"
            console.log("password not valid");
            return false;
        }
        else if (data["cnfPassword"] != data["password"]) {
            this.ErrorBoard.getComponent(Label).string = "Password not matched as above! ❌"
            console.log("Please fill same password as above");
            return false
        }

        this.ErrorBoard.getComponent(Label).string = "All Done! ✅"
        console.log("All Done! ✅");
        return true;

    }
}

