import { _decorator, Component, Node, AudioSource, AudioClip, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('soundManager')
class soundManager {
    private static _instance: soundManager = null!;
    private _audioSource: AudioSource = null!;
    private _SoundEffectAudioSource: AudioSource = null!;
    private volume: number = 1!;
    // private canPlayMusic = JSON.parse(sys.localStorage.getItem("userSettings")) ? JSON.parse(sys.localStorage.getItem("userSettings")).canPlayMusic : true;
    // private canPlaySound = JSON.parse(sys.localStorage.getItem("userSettings")) ? JSON.parse(sys.localStorage.getItem("userSettings")).canPlaySound : true;
    private canPlayMusic = true;
    private canPlaySound = true;
    private soundManager() {

    };



    public static getInstance() {
        if (!soundManager._instance) {
            soundManager._instance = new soundManager();
        }
        return soundManager._instance;
    }

    init(audioSource: AudioSource) {
        this._audioSource = audioSource;
    }

    initSoundEffectAS(audioSource: AudioSource) {
        this._SoundEffectAudioSource = audioSource;
    }


    musicVolumeController(volume) {
        this._audioSource.volume = volume;
    }

    playOneShotSoundEffect(clip: AudioClip, volume: number) {
        if (!this.canPlayMusic) {
            return;
        }
        if (clip) {
            this._audioSource.playOneShot(clip, volume);
        } else {
            console.log(clip, "Invalid audio clip format");
        }
    }

    playSoundEffect(clip: AudioClip, loop: boolean = false, volume: number = 1) {
        if (!this.canPlaySound) {
            this._SoundEffectAudioSource.clip = clip;
            return;
        }
        if (clip) {
            this.stopSoundEffect();
            this._SoundEffectAudioSource.clip = clip;
            this._SoundEffectAudioSource.loop = loop;
            this._SoundEffectAudioSource.volume = volume;
            this._SoundEffectAudioSource.play();
        } else {
            console.log(clip, "Invalid audio clip format");
        }
    }

    stopSoundEffect() {
        this._SoundEffectAudioSource.stop();
    }

    playMusic(loop: boolean) {
        if (!this.canPlayMusic) {
            return;
        }
        this._audioSource.loop = loop;
        if (!this._audioSource.playing) {
            this._audioSource.play();
        }
    }

    playMusicClip(clip: AudioClip, loop: boolean, volume: number = 1) {
        console.log(this.canPlayMusic);

        if (!this.canPlayMusic) {
            this._audioSource.clip = clip;
            return;
        }
        if (clip) {
            this.stopMusic();
            this._audioSource.clip = clip;
            this._audioSource.loop = loop;
            this._audioSource.volume = volume;
            this._audioSource.play();
        } else {
            console.log(clip, "Invalid audio clip format");
        }
    }

    stopMusic() {
        this._audioSource.stop();
    }

    set CanPlayMusic(value: boolean) {
        if (value) {
            this._audioSource.play();
        } else {
            this._audioSource.pause();
        }
        if (sys.localStorage.getItem("userSettings")) {
            let userSettings = JSON.parse(sys.localStorage.getItem("userSettings"));
            userSettings.canPlayMusic = value;
            localStorage.setItem("userSettings", JSON.stringify(userSettings));
        }

        this.canPlayMusic = value;
    }

    get CanPlayMusic(): boolean {
        return this.canPlayMusic;
    }

    set CanPlaySound(value: boolean) {
        if (value) {
            this._SoundEffectAudioSource.play();
        } else {
            this._SoundEffectAudioSource.stop();
        }
        if (sys.localStorage.getItem("userSettings")) {
            let userSettings = JSON.parse(sys.localStorage.getItem("userSettings"));
            userSettings.canPlaySound = value;
            localStorage.setItem("userSettings", JSON.stringify(userSettings));
        }
        this.canPlaySound = value;
    }

    get CanPlaySound(): boolean {
        return this.canPlaySound;
    }


}

const soundManagerInstance = soundManager.getInstance();

export default soundManagerInstance;