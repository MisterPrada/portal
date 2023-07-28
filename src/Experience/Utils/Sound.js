import * as THREE from 'three'
import EventEmitter from './EventEmitter.js'
import Experience from '../Experience.js'

export default class Sound extends EventEmitter
{
    constructor()
    {
        super()

        this.experience = new Experience()
        this.camera = this.experience.camera.instance
        this.resources = this.experience.resources
        this.renderer = this.experience.renderer.instance

        this.soundsCreated = false;
        this.fftSize = 128;
        this.format = ( this.renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;

    }

    isTabVisible() {
        return document.visibilityState === "visible";
    }

    handleVisibilityChange() {
        if (this.isTabVisible()) {
            this.backgroundSound.play();
            this.listener.setMasterVolume(1)
        } else {
            this.backgroundSound.pause();
            this.listener.setMasterVolume(0)
        }
    }

    createSounds() {
        if ( this.soundsCreated === true )
            return

        this.listener = new THREE.AudioListener();
        this.camera.add( this.listener );

        this.backgroundSound = new THREE.Audio( this.listener );
        this.backgroundSound.setBuffer( this.resources.items.backgroundSound );
        this.backgroundSound.setLoop( true );
        this.backgroundSound.setVolume( 0.8 );
        this.backgroundSound.play();

        // create an AudioAnalyser, passing in the sound and desired fftSize
        this.backgroundSoundAnalyser = new THREE.AudioAnalyser( this.backgroundSound, this.fftSize );
        this.audioTexture = new THREE.DataTexture( this.backgroundSoundAnalyser.data, this.fftSize / 2, 1, this.format );

        this.soundsCreated = true;


        document.addEventListener('visibilitychange', () => this.handleVisibilityChange(), false);

        // window.addEventListener('blur', () => this.backgroundSound.pause());
        // window.addEventListener('focus', () => {
        //     if (isTabVisible()) {
        //         this.backgroundSound.play();
        //     }
        // });

    }

    update() {
        if ( this.soundsCreated === false )
            return
        this.backgroundSoundAnalyser.getFrequencyData();
        this.audioTexture.needsUpdate = true;
    }
}
