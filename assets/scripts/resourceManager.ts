import { _decorator, Asset, AudioClip, AudioSource, Component, Label, Node, ProgressBar, resources, SpriteFrame, error, path, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('resourceManager')
class resourceManager extends Component {

    // @property(Prefab)
    // AudioPrefab: Prefab | null = null;
    AudioPrefab: Prefab = null;
    private gameAudios = new Array<AudioClip>();

    protected onLoad(): void {


    }


    // loadAudio = (path: string) => {
    //     resources.loadDir(path, AudioClip, (err, audioAssets) => {
    //         if (!err) {

    //             this.gameAudios = audioAssets;
    //         } else {
    //             console.log(err);
    //         }
    //         // ...
    //     });
    // }

    // getAudio(): AudioClip[] { return this.gameAudios; }



    start() {

    }

    update(deltaTime: number) {

    }

    public loadAudioPrefab(path) {
        return new Promise((resolve, reject) => {
            if (this.AudioPrefab != null) {
                resolve(this.gameAudios);
            } else {
                resources.load(path, (err: Error | null, data: Prefab) => {
                    if (err) {
                        // console.log("ERROR");

                        reject(err);
                        error("Load Audio Prefab :" + err);
                    } else {
                        // console.log("LOADED: ", data);

                        this.AudioPrefab = data;
                    }
                    resolve(this.AudioPrefab);
                });
            }
        })
    }

    public getAudioPrefab() {
        return this.AudioPrefab;
    }


    public loadMusicFiles(path: string) {
        return new Promise((resolve, reject) => {
            if (this.gameAudios.length > 0) {
                resolve(this.gameAudios);
            } else {
                resources.loadDir(path, (err: Error | null, data: AudioClip[]) => {
                    if (err) {
                        // console.log("ERROR");

                        reject(err);
                        error("load audio files :" + err);
                    } else {
                        // console.log("LOADED: ", data);

                        this.gameAudios = data;
                    }
                    resolve(this.gameAudios);
                });
            }
        });
    }

    public getMusicFile(name: string): AudioClip {
        if (this.gameAudios) {
            let clip = this.gameAudios.find((clip) => clip.name == name);
            return clip || null;
        }
    }



}

const resourceManagerInstance = new resourceManager();
export default resourceManagerInstance;
