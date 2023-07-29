import * as THREE from 'three'

import Experience from '../Experience.js'
import Environment from './Environment.js'
import Portal from './Portal/Portal.js'
import Text from './Text.js'
import Flows from './Flows.js'

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

                    const pointB = new THREE.Vector3(0.3, 0.8, -0.9)
                    this.flows = new Flows(
                        {
                            pointA: new THREE.Vector3(0.3, -3, 0),
                            pointB: pointB,
                            controlPoint1: new THREE.Vector3(4, -4.0, -8),
                            controlPoint2: new THREE.Vector3(6, 5.0, 5.0),
                            uSpeed: 0.078,
                            uPerlinMultiplier: 0.780,
                            uPerlinFrequency:  2.0,
                            uTimeFrequency: 0.30,
                        }
                    )

                    this.flows2 = new Flows(
                        {
                            pointA: new THREE.Vector3(0.3, -3, 0),
                            pointB: pointB,
                            controlPoint1: new THREE.Vector3(0, -3.0, -15),
                            controlPoint2: new THREE.Vector3(-8, 10.0, 4.0),
                            uSpeed: 0.078,
                            uPerlinMultiplier: 0.780,
                            uPerlinFrequency:  2.0,
                            uTimeFrequency: 0.30,
                        }
                    )

                    this.flows3 = new Flows(
                        {
                            pointA: new THREE.Vector3(0.3, -100, 20),
                            pointB: pointB,
                            controlPoint1: new THREE.Vector3(0, -3.0, 10),
                            controlPoint2: new THREE.Vector3(8, 10.0, 4.0),
                            uSpeed: 0.078,
                            uPerlinMultiplier: 0.780,
                            uPerlinFrequency:  2.0,
                            uTimeFrequency: 0.30,
                        }
                    )

                    this.portal = new Portal({
                        colors:
                        // {
                        //     a: '#130000',
                        //     b: '#ff000a',
                        //     c: '#ff661e',
                        // }
                            {
                                a: '#000000',
                                b: '#0068f8',
                                c: '#ffffff',
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
        if (this.camera)
            this.camera.animateCameraPosition();

        if ( this.text )
            this.text.animateTextShow()

        if ( this.flows )
            this.flows.animation()

        if ( this.flows2 )
            this.flows2.animation()

        if ( this.flows3 )
            this.flows3.animation()
    }

    resize() {
        // if (this.godRays)
        //     this.godRays.resize()
    }

    update()
    {
        if ( this.flows )
            this.flows.update()

        if ( this.flows2 )
            this.flows2.update()

        if ( this.flows3 )
            this.flows3.update()

        if ( this.portal )
            this.portal.update()

        if ( this.text )
            this.text.update()

        if ( this.sound )
            this.sound.update()
    }
}
