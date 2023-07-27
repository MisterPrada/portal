import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from "gsap";
import Time from "../Utils/Time.js";
export default class Itachi {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.world = this.experience.world
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer.instance
        this.timeline = this.experience.timeline

        this.parameters = {
            position: new THREE.Vector3(0, -150, 0),
            scale: new THREE.Vector3(100, 100, 100),
        }


        this.setModel()
        //this.setDebug()
    }

    setModel() {
        this.itachi = this.experience.resources.items.itachiModel.scene
        this.itachi.position.copy(this.parameters.position);
        this.itachi.scale.copy(this.parameters.scale);

        this.itachi.traverse((child) => {
            if (child.isMesh && child.name == 'model_2001') {
                //child.layers.set(5)
                this.itachiBody = child
            }

            if (child.isMesh && child.name == 'model_1') {
                this.itachiEye = child

                this.itachiEye.material.color = new THREE.Color(0xffffff)
                this.itachiEye.material.transparent = true
                this.itachiEye.material.opacity = 0.0
                this.itachiEye.material.emissiveIntensity = 0.03
                this.itachiEye.material.emissive = new THREE.Color(0xff0000)
                this.itachiEye.material.blending = THREE.NormalBlending
            }

            if (child.isMesh && child.name == 'model_2001') {
                //child.layers.enable(5)
                //child.material.emissive = new THREE.Color(0xffffff)
                child.material = new THREE.MeshLambertMaterial({
                    color: 0x000000,
                });

                child.material.side = THREE.DoubleSide
            }
        });

        this.scene.add(this.itachi);

        // create red cube
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        this.cube = new THREE.Mesh( geometry, material );

        this.waveTarget = new THREE.Vector3(2.3, 28, 5);
    }

    setEyeAnimation() {
        this.timeline.add(
            gsap.to(this.itachiEye.material, {
                duration: 4,
                delay: 3,
                opacity: 1.0,
                ease: "expo.out",
                onStart: () => {
                    this.experience.sound.sharinganSound.play()
                },
                onUpdate: () => {
                    if (!this.shockWaveClock) {
                        this.shockWaveClock = new Time()
                        this.world.godRays.shockWavePass.enabled = true
                        this.world.godRays.shockWaveShader.uniforms['uTime'].value = 0.0

                        setTimeout(() => {
                            this.world.godRays.shockWavePass.enabled = false
                            this.experience.sound.crowsSound.play()
                        }, 1000);
                    }else{
                        this.world.godRays.shockWaveShader.uniforms['uTime'].value = this.shockWaveClock.elapsed
                    }
                },
                onComplete: () => {

                }
            }),
            "start"
        )

        this.timeline.add(
            gsap.to(this.experience.world.godRays.postprocessing.godrayCombineUniforms.fGodRayIntensity, {
                duration: 12,
                delay: 4,
                value: 0.40,
                ease: "Power4.out",
            }),
            "start"
        )

        this.timeline.add(
            gsap.to(this.experience.world.environment.ambientLight, {
                duration: 12,
                delay: 4,
                intensity: 0.1,
                ease: "Power4.out",
            }),
            "start"
        )

        this.timeline.add(
            gsap.to(this.experience.world.godRays.sunPosition, {
                duration: 16,
                delay: 5,
                y: 1000.0,
                ease: "Power4.out",
            }),
            "start"
        )

        this.timeline.add(
            gsap.to(this.experience.world.godRays.bloomPass, {
                duration: 8,
                //delay: 1,
                strength: 1.26,
                ease: "Power4.out",
            }),
            "start"
        )
    }

    update() {
        const NDCCoords = this.waveTarget.clone().project(this.camera.instance);
        const x = (NDCCoords.x * .5 + .5);
        const y = 1.0 - (NDCCoords.y * -.5 + .5);
        this.world.godRays.shockWaveShader.uniforms['uCenter'].value = new THREE.Vector2(x, y);
    }

    setDebug() {

    }
}
