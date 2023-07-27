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

        this.soundsCreated = false;

    }

    isTabVisible() {
        return document.visibilityState === "visible";
    }

    handleVisibilityChange() {
        if (this.isTabVisible()) {
            this.backgroundSound.play();
            this.crowsSound.play();
            this.listener.setMasterVolume(1)
        } else {
            this.backgroundSound.pause();
            this.crowsSound.pause();
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
        this.backgroundSound.setVolume( 0.5 );
        this.backgroundSound.play();

        this.sharinganSound = new THREE.Audio( this.listener );
        this.sharinganSound.setBuffer( this.resources.items.sharinganSound );
        this.sharinganSound.setLoop( false );
        this.sharinganSound.setVolume( 0.7 );

        this.crowsSound = new THREE.Audio( this.listener );
        this.crowsSound.setBuffer( this.resources.items.crowsSound );
        this.crowsSound.setLoop( true );
        this.crowsSound.setVolume( 0.4 );

        this.soundsCreated = true;


        document.addEventListener('visibilitychange', () => this.handleVisibilityChange(), false);

        // window.addEventListener('blur', () => this.backgroundSound.pause());
        // window.addEventListener('focus', () => {
        //     if (isTabVisible()) {
        //         this.backgroundSound.play();
        //     }
        // });

    }
}
