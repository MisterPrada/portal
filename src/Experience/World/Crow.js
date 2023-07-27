import * as THREE from 'three'
import Experience from '../Experience.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import gsap from "gsap";
export default class Crow {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer.instance
        this.timeline = this.experience.timeline

        this.parameters = {
            position: new THREE.Vector3(0, 130, -200),
            scale: new THREE.Vector3(1.0, 1.0, 1.0),
        }


        this.setModels()
        //this.setDebug()
    }

    setModels() {
        this.model = this.experience.resources.items.crowModel.scene
        this.model.position.copy(this.parameters.position);
        this.model.scale.copy(this.parameters.scale);
        this.scene.add(this.model);


        this.model2 = clone(this.experience.resources.items.crowModel.scene)
        this.model2.position.copy(new THREE.Vector3(0, 150, -200));
        this.model2.scale.copy(new THREE.Vector3(0.7, 0.7, 0.7));
        this.scene.add(this.model2);

        this.model3 = clone(this.experience.resources.items.crowModel.scene)
        this.model3.position.copy(new THREE.Vector3(0, 180, -200));
        this.model3.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
        this.scene.add(this.model3);

        this.model4 = clone(this.experience.resources.items.crowModel.scene)
        this.model4.position.copy(new THREE.Vector3(0, 170, -150));
        this.model4.scale.copy(new THREE.Vector3(1, 1, 1));
        this.scene.add(this.model4);

        this.model5 = clone(this.experience.resources.items.crowModel.scene)
        this.model5.position.copy(new THREE.Vector3(0, 200, -170));
        this.model5.scale.copy(new THREE.Vector3(1, 1, 1));
        this.scene.add(this.model5);
    }

    animationModel(model, timeOffset, radius, centerOffset, directionSin, speed) {
        // save old position
        let oldPos = model.position.clone();

        model.position.x = radius * Math.cos((this.time.elapsed * speed + timeOffset) * directionSin) - centerOffset;
        model.position.z = radius * Math.sin((this.time.elapsed * speed + timeOffset) * directionSin) - centerOffset;

        // create a new vector representing the direction of motion
        let direction = new THREE.Vector3().subVectors(model.position, oldPos).normalize().multiplyScalar(-1);

        // create a point in space to look at
        let lookAtTarget = new THREE.Vector3().addVectors(model.position, direction);

        // calculate the quaternion for the lookAtTarget
        let lookAtQuaternion = new THREE.Quaternion().setFromRotationMatrix(
            new THREE.Matrix4().lookAt(model.position, lookAtTarget, new THREE.Vector3(0, 1, 0))
        );

        // calculate the quaternion for the tilt
        let tiltQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), directionSin * Math.PI / 8); // tilt 22.5 degrees

        // multiply the quaternions
        let finalQuaternion = lookAtQuaternion.multiply(tiltQuaternion);

        model.setRotationFromQuaternion(finalQuaternion);
    }

    update() {
        this.animationModel(this.model, 0.0, 400, 200, 1, 0.8)
        this.animationModel(this.model2, 20.0, 100, 200, 1, 0.7)
        this.animationModel(this.model3, 55.0, 250, 50, -1, 0.9)
        this.animationModel(this.model4, 105.0, 120, -40, -1, 0.8)
        this.animationModel(this.model5, 105.0, 70, -70, -1, 0.9)
    }

    setDebug() {

    }
}
