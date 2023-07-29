import * as THREE from 'three'
import gsap from 'gsap'

import Experience from '../Experience.js'
import vertexShader from '../shaders/Flows/vertex.glsl'
import fragmentShader from '../shaders/Flows/fragment.glsl'

export default class Flows
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.resources = this.experience.resources
        this.scene = this.experience.scene
        this.renderer = this.experience.renderer
        this.sound = this.experience.world.sound
        this.time = this.experience.time
        this.debug = this.experience.debug.debug
        this.timeline = this.experience.timeline

        this.count = 20000

        this.pointA = _options.pointA
        this.pointB = _options.pointB
        this.controlPoint1 = _options.controlPoint1
        this.controlPoint2 = _options.controlPoint2
        this.uSpeed = _options.uSpeed
        this.uPerlinMultiplier = _options.uPerlinMultiplier
        this.uPerlinFrequency = _options.uPerlinFrequency
        this.uTimeFrequency = _options.uTimeFrequency

        this.setPositions()
        this.setGeometry()
        this.setMaterial()
        this.setPoints()

        this.setDebug()
    }

    reset()
    {
        this.geometry.dispose()

        this.setPositions()
        this.setGeometry()

        this.points.geometry = this.geometry
    }

    setPositions()
    {
        this.positions = new Float32Array(this.count * 3)

        let i = 0


        for(; i < this.count; i++)
        {
            const azimuthalAngle = Math.random() * Math.PI * 2 // Угол вокруг Y
            const polarAngle = Math.acos(2 * Math.random() - 1) // Угол от оси Y

            const radius = Math.cbrt(Math.random()) * 0.7 // Используем корень третьей степени, чтобы равномерно распределить точки по объему
            //const radius = 10000;

            this.positions[i * 3 + 0] = Math.sin(polarAngle) * Math.cos(azimuthalAngle) * radius + Math.random() * 0.2
            this.positions[i * 3 + 1] = Math.sin(polarAngle) * Math.sin(azimuthalAngle) * radius + Math.random() * 0.2
            this.positions[i * 3 + 2] = Math.cos(polarAngle) * radius + Math.random() * 0.2
        }
    }


    setGeometry()
    {
        const sizes = new Float32Array(this.count)
        const startTime = new Float32Array(this.count)

        for(let i = 0; i < this.count; i++)
        {
            sizes[i] = 0.2 + Math.random() * 0.8
            startTime[i] = Math.random()

        }

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
        this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        this.geometry.setAttribute('aStartTime', new THREE.BufferAttribute(startTime, 1))
    }

    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            uniforms:
                {
                    uTime: { value: 0 },
                    uDelta: { value: 16 },
                    uPixelRatio: { value: this.config.pixelRatio },
                    uSize: { value: 45 },
                    uMaskTexture: { value: this.resources.items.particleMaskTexture },
                    uSeed: { value: Math.random() },
                    uOpacity: { value: 0.5 },

                    uSpeed: { value: this.uSpeed },
                    uPerlinMultiplier: { value: this.uPerlinMultiplier },
                    uPerlinFrequency: { value: this.uPerlinFrequency },
                    uTimeFrequency: { value: this.uTimeFrequency },

                    uPointA: { value: this.pointA },
                    uPointB: { value: this.pointB },
                    uControlPoint1: { value: this.controlPoint1 },
                    uControlPoint2: { value: this.controlPoint2 },

                    uAudioData: { value: this.sound.audioTexture },
                },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })


        if(this.debug)
        {

        }
    }

    setPoints()
    {
        this.points = new THREE.Points(this.geometry, this.material)
        this.points.frustumCulled = false
        this.scene.add(this.points)
    }

    animation()
    {
        this.timeline.add(
            gsap.from(this.material.uniforms.uOpacity, {
                duration: 10,
                value: 0.0,
                ease: "linear",
            }),
            "start"
        )
    }

    setDebug()
    {
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'Flows'
            })

            this.debugFolder
                .addInput(
                    this.material.uniforms.uSpeed,
                    'value',
                    {
                       label: 'uSpeed', min: 0.001, max: 1, step: 0.001
                    }
                )
            this.debugFolder.addInput(
                    this.material.uniforms.uPerlinMultiplier,
                    'value',
                    {
                        label: 'uPerlinMultiplier', min: 0.001, max: 5, step: 0.001
                    }
                )
            this.debugFolder.addInput(
                    this.material.uniforms.uPerlinFrequency,
                    'value',
                    {
                        label: 'uPerlinFrequency', min: 0.001, max: 5, step: 0.001
                    }
                )
            this.debugFolder.addInput(
                    this.material.uniforms.uTimeFrequency,
                    'value',
                    {
                        label: 'uTimeFrequency', min: 0.001, max: 5, step: 0.001
                    }
                )
        }
    }

    update()
    {
        this.material.uniforms.uTime.value = this.time.elapsed
        this.material.uniforms.uDelta.value = this.time.delta
    }
}
