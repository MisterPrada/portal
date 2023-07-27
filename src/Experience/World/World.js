import Experience from '../Experience.js'
import Environment from './Environment.js'
import Portal from './Portal/Portal.js'
import Text from './Text.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.camera = this.experience.camera;
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.html = this.experience.html
        this.sound = this.experience.sound

        // Wait for resources
        this.resources.on('ready', () =>
        {
            this.html.playButton.classList.add("fade-in");
            this.html.playButton.addEventListener('click', () => {

                this.html.playButton.classList.replace("fade-in", "fade-out");
                this.sound.createSounds();

                setTimeout(() => {
                    this.experience.time.start = Date.now()
                    this.experience.time.elapsed = 0

                    // Setup
                    //this.godRays = new GodRays()
                    //this.itachi = new Itachi()
                    //this.crow = new Crow()
                    this.text = new Text()
                    this.portal = new Portal({
                        colors:
                        // {
                        //     a: '#130000',
                        //     b: '#ff000a',
                        //     c: '#ff661e',
                        // }
                            {
                                a: '#420e5f',
                                b: '#858585',
                                c: '#131111',
                            }
                    })
                    this.environment = new Environment()

                    // Remove preloader
                    this.html.preloader.classList.add("preloaded");
                    setTimeout(() => {
                        this.html.preloader.remove();
                        this.html.playButton.remove();
                    }, 2500);

                    // Animation timeline
                    this.animationPipeline();
                }, 100);
            }, { once: true });
        })
    }

    animationPipeline() {
        // if (this.itachi)
        //     this.itachi.setEyeAnimation()
        //
        // if (this.camera)
        //     this.camera.animateCameraPosition();

        if ( this.text )
            this.text.animateTextPosition()
    }

    resize() {
        // if (this.godRays)
        //     this.godRays.resize()
    }

    update()
    {
        if ( this.portal )
            this.portal.update()

        if ( this.text )
            this.text.update()
    }
}
