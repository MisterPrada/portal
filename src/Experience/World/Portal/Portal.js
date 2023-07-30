import * as THREE from 'three'
import Experience from '../../Experience.js'
import Particles from './Particles.js'
import Halo from './Halo.js'
import EventHorizon from './EventHorizon.js'
import Smoke from './Smoke.js'
import Lightnings from './Lightnings.js'
import ShockWave from "./ShockWave.js";
import gsap from "gsap";
import Time from "../../Utils/Time.js";
export default class Portal {
    constructor(_options) {
        this.experience = new Experience()
        this.debug = this.experience.debug.debug
        this.world = this.experience.world
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance
        this.timeline = this.experience.timeline

        this.colorsSetting = _options.colors

        this.parameters = {
            position: new THREE.Vector3(0, 0, 0),
            scale: new THREE.Vector3(0.0008, 0.0008, 0.0008),

            portalPosition: new THREE.Vector3(0.3, 0.8, -1),
            portalScale: new THREE.Vector3(0.9, 0.9, 0.9),
        }

        this.group = new THREE.Group()
        this.group.position.copy(this.parameters.portalPosition);
        this.group.scale.copy(this.parameters.portalScale);
        this.scene.add(this.group)

        this.setDebug()

        this.setModel()
        this.setColors()
        this.setParticles()
        this.setHalo()
        this.setEventHorizon()
        this.setSmoke()
        this.setLightnins()
        //this.setShockWave()

        this.setAnimation()

        this.group.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false
            }
        });

    }

    setModel() {
        this.resource = this.experience.resources.items.portalModel
        this.model = this.experience.resources.items.portalModel.scene

        this.model.position.copy(this.parameters.position);
        this.model.scale.copy(this.parameters.scale);

        // rotate 90 degrees
        this.model.rotateY(Math.PI / 2);

        this.scene.add(this.model);
    }

    setColors() {
        this.colors = {}

        for(let _colorName in this.colorsSetting)
        {
            const color = {}
            color.value = this.colorsSetting[_colorName]
            color.instance = new THREE.Color(color.value)

            this.colors[_colorName] = color
        }

        if(this.debug)
        {
            for(const _colorName in this.colors)
            {
                const color = this.colors[_colorName]

                this.debugFolder
                    .addInput(
                        color,
                        'value',
                        {
                            label: _colorName, view: 'color'
                        }
                    )
                    .on('change', () =>
                    {
                        color.instance.set(color.value)
                    })
            }
        }
    }

    setParticles() {
        this.particles = new Particles({ debugFolder: this.debugFolder, colors: this.colors })
        this.group.add(this.particles.points)
    }

    setHalo() {
        this.halo = new Halo({ debugFolder: this.debugFolder, colors: this.colors })
        this.halo.mesh.scale.copy(new THREE.Vector3(1.2, 1.2, 1.2));
        this.group.add(this.halo.mesh)
    }

    setEventHorizon() {
        this.eventHorizon = new EventHorizon({ debugFolder: this.debugFolder, colors: this.colors })
        this.group.add(this.eventHorizon.mesh)
    }

    setSmoke() {
        this.smoke = new Smoke({ debugFolder: this.debugFolder, colors: this.colors })
        this.group.add(this.smoke.group)
    }

    setLightnins()
    {
        this.lightnings = new Lightnings({ debugFolder: this.debugFolder, colors: this.colors })
        this.group.add(this.lightnings.group)
    }

    setShockWave()
    {
        this.shockWave = new ShockWave(this)
        this.group.add(this.shockWave.mesh)
    }

    setAnimation() {
        this.animation = {}

        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        // Actions
        this.animation.actions = {}

        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])

        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Play the action
        this.animation.play = (name) =>
        {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }

        this.portalShow()
    }

    portalShow() {

        // halo show
        this.timeline.add(
            gsap.from(this.halo.mesh.scale, {
                duration: 4,
                delay: 8,
                x: .01,
                y: .01,
                z: .01,
                //opacity: 1.0,
                ease: "linear",
                onStart: () => {
                },
                onUpdate: () => {
                },
                onComplete: () => {
                }
            }),
            "start"
        )

        // event horizon show
        this.timeline.add(
            gsap.from(this.eventHorizon.material.uniforms.uOpacity, {
                duration: 10,
                delay: 8,
                value: 0.0,
                ease: "power4.inOut",
            }),
            "start"
        )

        // particles show
        this.timeline.add(
            gsap.from(this.particles.material.uniforms.uSize, {
                duration: 10,
                delay: 0,
                value: 20.0,
                ease: "linear",
            }),
            "start"
        )

        //flow fields show
        // this.timeline.add(
        //     gsap.from(this.particles.flowField.plane.material.uniforms.uDecaySpeed, {
        //         duration: 10,
        //         delay: 0,
        //         value: 0.00449,
        //         ease: "linear",
        //     }),
        //     "start"
        // )
        // this.timeline.add(
        //     gsap.from(this.particles.flowField.plane.material.uniforms.uPerlinFrequency, {
        //         duration: 10,
        //         delay: 0,
        //         value: 5,
        //         ease: "linear",
        //     }),
        //     "start"
        // )

        // this.timeline.add(
        //     gsap.from(this.particles.flowField.plane.material.uniforms.uPerlinMultiplier, {
        //         duration: 10,
        //         delay: 0,
        //         value: 0.064,
        //         ease: "linear",
        //     }),
        //     "start"
        // )

        // uDecaySpeed: { value: 0.00049 },
        // uPerlinFrequency: { value: 4 },
        // uPerlinMultiplier: { value: 0.004 },

    }

    update() {
        if ( this.animation )
            this.animation.mixer.update(this.time.delta)

        this.particles.update()
        this.halo.update()
        this.eventHorizon.update()
        this.smoke.update()
        this.lightnings.update()
        //this.shockWave.update()
    }

    setDebug() {
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'portal',
                expanded: false
            })
        }
    }
}
