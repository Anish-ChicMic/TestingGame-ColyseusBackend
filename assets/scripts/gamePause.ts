import { _decorator, Component, director, game, Input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('gamePause')
export class gamePause extends Component {

    @property({ type: Node })
    quit: Node = null;

    @property({ type: Node })
    home: Node = null;

    @property({ type: Node })
    resume: Node = null;
    protected onLoad(): void {
        director.preloadScene("startScreen");
        this.quit.on(Input.EventType.TOUCH_START, () => {
            game.end()
        });
        this.home.on(Input.EventType.TOUCH_START, () => {
            this.node.destroy();
            director.resume();
            director.loadScene("startScreen");
        })
        this.resume.on(Input.EventType.TOUCH_START, () => {
            director.resume();
            this.node.destroy();
        })





    }

    start() {

    }

    update(deltaTime: number) {

    }
}

