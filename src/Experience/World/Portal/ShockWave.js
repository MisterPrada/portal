import * as THREE from 'three'

import Experience from '../../Experience.js'
import vertexShader from '../../shaders/ShockWave/vertex.glsl'
import fragmentShader from '../../shaders/ShockWave/fragment.glsl'

export default class ShockWave
{
    constructor(portal)
    {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.resources = this.experience.resources
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.sound = this.experience.world.sound
        this.sizes = this.experience.sizes
        this.portal = portal


        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.geometry = new THREE.PlaneGeometry(3, 3, 1, 1)
    }

    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
            uniforms:
            {
                uTime: { value: 0 },
                baseTexture: { value: this.portal.particles.flowField.texture },
                uResolution: { value: new THREE.Vector2( 3, 3 ) },
                uCenter: { value: new THREE.Vector2(0.5, 0.5 ) },
                uWaveParams: { value: new THREE.Vector3(8.0, 2.8, 0.01 ) },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        //this.scene.add(this.mesh)
    }

    update()
    {
        this.material.uniforms.uTime.value = this.time.elapsed
    }
}
