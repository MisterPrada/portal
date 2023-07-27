import * as THREE from 'three'
import Experience from '../../Experience'

export default class Smoke
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.resources = this.experience.resources
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.world = this.experience.world

        this.debug = _options.debugFolder
        this.colors = _options.colors

        this.count = 40
        this.group = new THREE.Group()
        this.dummy = new THREE.Object3D()

        // if(this.debug)
        // {
        //     this.debugFolder = this.debug.addFolder({
        //         title: 'smoke'
        //     })
        // }

        this.setGeometry()
        this.setItems()
    }

    setGeometry()
    {
        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    }

    setItems()
    {
        this.items = []

        for(let i = 0; i < this.count; i++)
        {
            const item = {}

            item.floatingSpeed = Math.random() * 0.5
            item.rotationSpeed = (Math.random() - 0.5) * Math.random() * 0.0002 + 0.0002
            item.progress = Math.random()

            // Material
            item.material = new THREE.MeshBasicMaterial({
                depthWrite: false,
                // depthTest: false,
                transparent: true,
                blending: THREE.AdditiveBlending,
                alphaMap: this.resources.items.smokeTexture,
                side: THREE.DoubleSide,
                opacity: 1
                // opacity: 0.05 + Math.random() * 0.2
            })

            item.material.color = this.colors.b.instance

            // Scale
            item.scale = 0.2 + Math.random() * 0.5

            // Angle
            item.angle = Math.random() * Math.PI * 2

            // Mesh
            item.mesh = new THREE.Mesh(this.geometry, item.material)
            item.mesh.position.z = (i + 1) * 0.0005
            this.group.add(item.mesh)

            // Save
            this.items.push(item)
        }
    }

    resize()
    {
    }

    update()
    {
        const elapsedTime = this.time.elapsed + 123456789.123

        for(const _item of this.items)
        {
            // Progress
            _item.progress += this.time.delta * 0.1

            if(_item.progress > 1)
                _item.progress = 0

            // Opacity
            _item.material.opacity = Math.min((1 - _item.progress) * 2, _item.progress * 4)
            _item.material.opacity = Math.min(_item.material.opacity, 1)
            _item.material.opacity *= 0.25

            // Scale
            let scaleProgress =Math.min(_item.progress * 4, 1)
            scaleProgress = 1 - Math.pow(1 - scaleProgress, 4)
            const scale = scaleProgress * _item.scale

            _item.mesh.scale.set(scale, scale, scale)

            // Rotation
            _item.mesh.rotation.z = elapsedTime * 1000 * _item.rotationSpeed

            // Position
            // console.log(this.time.delta)
            const radius = 1 - _item.progress * _item.floatingSpeed
            _item.mesh.position.x = Math.sin(_item.angle) * radius
            _item.mesh.position.y = Math.cos(_item.angle) * radius
            // _item.mesh.position.y = Math.sin(elapsedTime * _item.floatingSpeed)
        }
    }
}
