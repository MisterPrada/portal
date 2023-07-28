import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from "gsap";

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.canvas = this.experience.canvas
        this.timeline = this.experience.timeline
        this.cursorEnabled = false

        this.lerpVector = new THREE.Vector3();

        this.setInstance()
        this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(25, this.sizes.width / this.sizes.height, 0.1, 3000)
        //const defaultCameraPosition = new THREE.Vector3(0.0, -100.0, 0.0);
        //const defaultCameraPosition = new THREE.Vector3(10.0, 20.0, -200);
        const defaultCameraPosition = new THREE.Vector3(0.0, 4.0, 5);

        this.instance.position.copy(defaultCameraPosition)

        this.lerpVector.copy(this.instance.position);

        this.scene.add(this.instance)
    }

    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.minDistance = 0;
        this.controls.maxDistance = 500;
        this.controls.enabled = true;
        this.controls.target = new THREE.Vector3(0, 1, 0);
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        if (this.cursorEnabled === true) {
            const lerpTarget = new THREE.Vector3();
            const targetX = 50.0 + this.experience.cursor.x * 40;
            const targetY = -50.0 + this.experience.cursor.y * 40;

            lerpTarget.set(targetX, targetY, this.instance.position.z)

            const lerpFactor = 0.8;  // регулирует скорость интерполяции

            this.lerpVector.lerp(new THREE.Vector3().copy(lerpTarget), lerpFactor * this.time.delta);

            this.instance.position.copy(this.lerpVector);
        }

        //this.instance.lookAt(new THREE.Vector3(0, 0, 0));

        this.controls.update()

        this.instance.updateMatrixWorld() // To be used in projection
    }

    animateCameraPosition() {
        // this.timeline.add(
        //     gsap.to(this.instance.position, {
        //         duration: 13,
        //         delay: 0.6,
        //         x: 10.0,
        //         y: -50.0,
        //         z: 150.0,
        //         ease: "power1.inOut",
        //         onComplete: () => {
        //             this.cursorEnabled = true
        //             this.lerpVector.copy(this.instance.position);
        //         }
        //     }),
        //     "start"
        // )
    }
}
