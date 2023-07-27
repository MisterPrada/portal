import * as THREE from 'three'
import { GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader } from 'three/addons/shaders/GodRaysShader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';

import shockContrastVertexShader from '../Shaders/Contrast/vertex.glsl';
import shockContrastFragmentShader from '../Shaders/Contrast/fragment.glsl';

import shockWaveVertexShader from '../Shaders/ShockWave/vertex.glsl'
import shockWaveFragmentShader from '../Shaders/ShockWave/fragment.glsl'

import bloomVertexShader from '../Shaders/Bloom/vertex.glsl'
import bloomFragmentShader from '../Shaders/Bloom/fragment.glsl'

import Experience from '../Experience.js'

export default class GodRays {
    constructor() {
        this.experience = new Experience()
        this.world = this.experience.world
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.sizes = this.experience.sizes
        this.time = this.experience.time
        this.camera = this.experience.camera.instance
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer.instance
        this.timeline = this.experience.timeline

        this.parameters = {
            position: new THREE.Vector3(0, 0, 0),
            scale: new THREE.Vector3(0, 0, 0),
        }

        this.container = {}
        this.materialDepth = {};

        this.sunPosition = new THREE.Vector3( 0, 300, - 1000 );
        this.clipPosition = new THREE.Vector4();
        this.screenSpacePosition = new THREE.Vector3();

        this.postprocessing = { enabled: true };

        this.orbitRadius = 600;

        this.bgColor  = 0x0f0000;
        this.sunColor = 0xff0000;

        // Use a smaller size for some of the god-ray render targets for better performance.
        this.godrayRenderTargetResolutionMultiplier = 1.0 / 4.0;

        this.setModel()
        this.setDebug()
    }

    setModel() {
        this.materialDepth = new THREE.MeshDepthMaterial();

        this.materialScene = new THREE.MeshBasicMaterial( { color: 0x000000 } );

        // tree

        this.tree = this.experience.resources.items.treeModel.children[0]


        this.tree.material = this.materialScene;
        this.tree.position.set( 0, - 150, - 150 );
        this.tree.scale.multiplyScalar( 400 );
        this.tree.rotation.y = -Math.PI / 2;
        this.scene.add( this.tree );

        this.renderer.setClearColor( 0xffffff );
        this.renderer.autoClear = false;

        this.initPostprocessing( window.innerWidth, window.innerHeight );
    }

    resize() {

        const renderTargetWidth = window.innerWidth;
        const renderTargetHeight = window.innerHeight;

        this.postprocessing.rtTextureColors.setSize( renderTargetWidth, renderTargetHeight );
        this.postprocessing.rtTextureDepth.setSize( renderTargetWidth, renderTargetHeight );
        this.postprocessing.rtTextureDepthMask.setSize( renderTargetWidth, renderTargetHeight );

        const adjustedWidth = renderTargetWidth * this.godrayRenderTargetResolutionMultiplier;
        const adjustedHeight = renderTargetHeight * this.godrayRenderTargetResolutionMultiplier;
        this.postprocessing.rtTextureGodRays1.setSize( adjustedWidth, adjustedHeight );
        this.postprocessing.rtTextureGodRays2.setSize( adjustedWidth, adjustedHeight );

        this.bloomComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.bloomComposer.setSize(this.sizes.width, this.sizes.height)

        this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.composer.setSize(this.sizes.width, this.sizes.height)

        this.shockWaveShader.uniforms.uResolution.value.x = this.sizes.width
        this.shockWaveShader.uniforms.uResolution.value.y = this.sizes.height
    }

    initPostprocessing( renderTargetWidth, renderTargetHeight ) {
        this.postprocessing.scene = new THREE.Scene();

        this.postprocessing.camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, - 10000, 10000 );
        this.postprocessing.camera.position.z = 100;

        this.postprocessing.scene.add( this.postprocessing.camera );

        this.postprocessing.rtTextureColors = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight, { type: THREE.HalfFloatType } );


        // BLOOM
        this.bloomParams = {
            threshold: 0,
            strength: 3.0,
            radius: 1.0,
            exposure: 1
        };
        this.renderScene = new RenderPass( this.scene, this.camera );
        this.renderSceneBloom = new RenderPass( this.postprocessing.scene, this.postprocessing.camera );

        this.bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        this.bloomPass.threshold = this.bloomParams.threshold;
        this.bloomPass.strength = this.bloomParams.strength;
        this.bloomPass.radius = this.bloomParams.radius;

        this.bloomComposer = new EffectComposer( this.renderer );
        this.bloomComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.bloomComposer.setSize(this.sizes.width, this.sizes.height)
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.addPass( this.renderScene );
        this.bloomComposer.addPass( this.bloomPass );

        this.mixPass = new ShaderPass(
            new THREE.ShaderMaterial( {
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
                },
                vertexShader: bloomVertexShader,
                fragmentShader: bloomFragmentShader,
                defines: {}
            } ), 'baseTexture'
        );
        this.mixPass.needsSwap = true;

        this.composer = new EffectComposer( this.renderer );
        this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.composer.setSize(this.sizes.width, this.sizes.height)

        this.composer.addPass( this.renderSceneBloom );

        this.composer.addPass( this.mixPass );

        // this.glitchPass = new GlitchPass();
        // this.composer.addPass( this.glitchPass );

        this.contrastShader = {
            uniforms: {
                "tDiffuse": { type: "t", value: null },
                "contrast":  { type: "f", value: 3.0 } // Level of contrast adjustment
            },
            vertexShader: shockContrastVertexShader,
            fragmentShader: shockContrastFragmentShader
        };

        this.contrastPass = new ShaderPass(this.contrastShader);
        this.composer.addPass(this.contrastPass);

        this.vignettePass = new ShaderPass(VignetteShader);


        this.vignettePass.uniforms['offset'].value = 0.9;
        this.vignettePass.uniforms['darkness'].value = 1.52;
        this.composer.addPass(this.vignettePass);

        this.shockWaveShader = new THREE.ShaderMaterial( {
            uniforms: {
                baseTexture: { value: null },
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2( this.sizes.width, this.sizes.height ) },
                uCenter: { value: new THREE.Vector2(0.50, 0.8 ) },
                uWaveParams: { value: new THREE.Vector3(8.0, 2.8, 0.01 ) },
            },
            vertexShader: shockWaveVertexShader,
            fragmentShader: shockWaveFragmentShader,
            defines: {}
        } )

        this.shockWavePass = new ShaderPass( this.shockWaveShader , 'baseTexture' );
        this.shockWavePass.enabled = false;
        this.composer.addPass(this.shockWavePass);

        // this.outputPass = new OutputPass( THREE.ReinhardToneMapping );
        // this.composer.addPass( this.outputPass );


        // Switching the depth formats to luminance from rgb doesn't seem to work. I didn't
        // investigate further for now.
        // pars.format = LuminanceFormat;

        // I would have this quarter size and use it as one of the ping-pong render
        // targets but the aliasing causes some temporal flickering

        this.postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight, { type: THREE.HalfFloatType } );
        this.postprocessing.rtTextureDepthMask = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight, { type: THREE.HalfFloatType } );

        // The ping-pong render targets can use an adjusted resolution to minimize cost

        const adjustedWidth = renderTargetWidth * this.godrayRenderTargetResolutionMultiplier;
        const adjustedHeight = renderTargetHeight * this.godrayRenderTargetResolutionMultiplier;
        this.postprocessing.rtTextureGodRays1 = new THREE.WebGLRenderTarget( adjustedWidth, adjustedHeight, { type: THREE.HalfFloatType } );
        this.postprocessing.rtTextureGodRays2 = new THREE.WebGLRenderTarget( adjustedWidth, adjustedHeight, { type: THREE.HalfFloatType } );

        // god-ray shaders

        this.godraysMaskShader = GodRaysDepthMaskShader;
        this.postprocessing.godrayMaskUniforms = THREE.UniformsUtils.clone( this.godraysMaskShader.uniforms );
        this.postprocessing.materialGodraysDepthMask = new THREE.ShaderMaterial( {

            uniforms: this.postprocessing.godrayMaskUniforms,
            vertexShader: this.godraysMaskShader.vertexShader,
            fragmentShader: this.godraysMaskShader.fragmentShader

        } );

        this.godraysGenShader = GodRaysGenerateShader;
        this.postprocessing.godrayGenUniforms = THREE.UniformsUtils.clone( this.godraysGenShader.uniforms );
        this.postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial( {

            uniforms: this.postprocessing.godrayGenUniforms,
            vertexShader: this.godraysGenShader.vertexShader,
            fragmentShader: this.godraysGenShader.fragmentShader

        } );

        this.godraysCombineShader = GodRaysCombineShader;
        this.postprocessing.godrayCombineUniforms = THREE.UniformsUtils.clone( this.godraysCombineShader.uniforms );
        this.postprocessing.materialGodraysCombine = new THREE.ShaderMaterial( {

            uniforms: this.postprocessing.godrayCombineUniforms,
            vertexShader: this.godraysCombineShader.vertexShader,
            fragmentShader: this.godraysCombineShader.fragmentShader

        } );

        this.godraysFakeSunShader = GodRaysFakeSunShader;
        this.postprocessing.godraysFakeSunUniforms = THREE.UniformsUtils.clone( this.godraysFakeSunShader.uniforms );
        this.postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial( {

            uniforms: this.postprocessing.godraysFakeSunUniforms,
            vertexShader: this.godraysFakeSunShader.vertexShader,
            fragmentShader: this.godraysFakeSunShader.fragmentShader

        } );

        this.postprocessing.godraysFakeSunUniforms.bgColor.value.setHex( this.bgColor );
        this.postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( this.sunColor );

        this.postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.35;

        this.postprocessing.quad = new THREE.Mesh(
            new THREE.PlaneGeometry( 1.0, 1.0 ),
            this.postprocessing.materialGodraysGenerate
        );
        this.postprocessing.quad.position.z = - 9900;
        this.postprocessing.scene.add( this.postprocessing.quad );
    }

    getStepSize( filterLen, tapsPerPass, pass ) {

        return filterLen * Math.pow( tapsPerPass, - pass );

    }

    filterGodRays( inputTex, renderTarget, stepSize ) {

        this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysGenerate;

        this.postprocessing.godrayGenUniforms[ 'fStepSize' ].value = stepSize;
        this.postprocessing.godrayGenUniforms[ 'tInput' ].value = inputTex;

        this.renderer.setRenderTarget( renderTarget );
        this.renderer.render( this.postprocessing.scene, this.postprocessing.camera );
        this.postprocessing.scene.overrideMaterial = null;

    }

    update() {
        //this.shockWaveShader.uniforms['uTime'].value = this.time.elapsed;

        // let NDC = new THREE.Vector3();
        // NDC.setFromMatrixPosition(this.world.itachi.itachi.matrixWorld);
        //
        // //
        // NDC.y += 200;
        // NDC.project(this.camera);
        // NDC.x =  NDC.x / 2  + 0.5;
        // NDC.y = - NDC.y / 2 + 0.5;
        //
        // this.shockWaveShader.uniforms['uCenter'].value.x = NDC.x;
        // this.shockWaveShader.uniforms['uCenter'].value.y = NDC.y;
        // console.log(NDC);
        this.render();
    }

    render() {
        const time = Date.now() / 4000;

        if ( this.postprocessing.enabled ) {

            this.clipPosition.x = this.sunPosition.x;
            this.clipPosition.y = this.sunPosition.y;
            this.clipPosition.z = this.sunPosition.z;
            this.clipPosition.w = 1;

            this.clipPosition.applyMatrix4( this.camera.matrixWorldInverse ).applyMatrix4( this.camera.projectionMatrix );

            // perspective divide (produce NDC space)

            this.clipPosition.x /= this.clipPosition.w;
            this.clipPosition.y /= this.clipPosition.w;

            this.screenSpacePosition.x = ( this.clipPosition.x + 1 ) / 2; // transform from [-1,1] to [0,1]
            this.screenSpacePosition.y = ( this.clipPosition.y + 1 ) / 2; // transform from [-1,1] to [0,1]
            this.screenSpacePosition.z = this.clipPosition.z; // needs to stay in clip space for visibilty checks

            // Give it to the god-ray and sun shaders

            this.postprocessing.godrayGenUniforms[ 'vSunPositionScreenSpace' ].value.copy( this.screenSpacePosition );
            this.postprocessing.godraysFakeSunUniforms[ 'vSunPositionScreenSpace' ].value.copy( this.screenSpacePosition );

            // -- Draw sky and sun --

            // Clear colors and depths, will clear to sky color

            this.renderer.setRenderTarget( this.postprocessing.rtTextureColors );
            this.renderer.clear( true, true, false );

            // Sun render. Runs a shader that gives a brightness based on the screen
            // space distance to the sun. Not very efficient, so i make a scissor
            // rectangle around the suns position to avoid rendering surrounding pixels.

            const sunsqH = 0.74 * window.innerHeight; // 0.74 depends on extent of sun from shader
            const sunsqW = 0.74 * window.innerHeight; // both depend on height because sun is aspect-corrected

            this.screenSpacePosition.x *= window.innerWidth;
            this.screenSpacePosition.y *= window.innerHeight;

            this.renderer.setScissor( this.screenSpacePosition.x - sunsqW / 2, this.screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
            this.renderer.setScissorTest( true );

            this.postprocessing.godraysFakeSunUniforms[ 'fAspect' ].value = window.innerWidth / window.innerHeight;

            this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysFakeSun;
            this.renderer.setRenderTarget( this.postprocessing.rtTextureColors );
            this.renderer.render( this.postprocessing.scene, this.postprocessing.camera );

            this.renderer.setScissorTest( false );

            // -- Draw scene objects --

            // Colors

            this.scene.overrideMaterial = null;
            this.renderer.setRenderTarget( this.postprocessing.rtTextureColors );
            this.renderer.render( this.scene, this.camera );

            // Depth

            this.scene.overrideMaterial = this.materialDepth;
            this.renderer.setRenderTarget( this.postprocessing.rtTextureDepth );
            this.renderer.clear();
            this.renderer.render( this.scene, this.camera );

            //

            this.postprocessing.godrayMaskUniforms[ 'tInput' ].value = this.postprocessing.rtTextureDepth.texture;

            this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysDepthMask;
            this.renderer.setRenderTarget( this.postprocessing.rtTextureDepthMask );
            this.renderer.render( this.postprocessing.scene, this.postprocessing.camera );

            // -- Render god-rays --

            // Maximum length of god-rays (in texture space [0,1]X[0,1])

            const filterLen = 1.0;

            // Samples taken by filter

            const TAPS_PER_PASS = 6.0;

            // Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
            // would start with a small filter support and grow to large. however
            // the large-to-small order produces less objectionable aliasing artifacts that
            // appear as a glimmer along the length of the beams

            // pass 1 - render into first ping-pong target
            this.filterGodRays( this.postprocessing.rtTextureDepthMask.texture, this.postprocessing.rtTextureGodRays2, this.getStepSize( filterLen, TAPS_PER_PASS, 1.0 ) );

            // pass 2 - render into second ping-pong target
            this.filterGodRays( this.postprocessing.rtTextureGodRays2.texture, this.postprocessing.rtTextureGodRays1, this.getStepSize( filterLen, TAPS_PER_PASS, 2.0 ) );

            // pass 3 - 1st RT
            this.filterGodRays( this.postprocessing.rtTextureGodRays1.texture, this.postprocessing.rtTextureGodRays2, this.getStepSize( filterLen, TAPS_PER_PASS, 3.0 ) );

            // final pass - composite god-rays onto colors

            this.postprocessing.godrayCombineUniforms[ 'tColors' ].value = this.postprocessing.rtTextureColors.texture;
            this.postprocessing.godrayCombineUniforms[ 'tGodRays' ].value = this.postprocessing.rtTextureGodRays2.texture;

            this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysCombine;

            this.renderer.setRenderTarget( null );
            this.scene.overrideMaterial = null;
            this.scene.background = new THREE.Color( 0x000000 );

            this.bloomComposer.render();

            this.scene.background = null;

            this.composer.render();
            this.postprocessing.scene.overrideMaterial = null;

        } else {

            this.renderer.setRenderTarget( null );
            this.renderer.render(this.scene, this.camera);
            this.postprocessing.scene.overrideMaterial = null;
        }

    }

    setDebug() {

        // Debug
        if(this.debug.active)
        {

            const bloomFolder = this.debug.ui.addFolder('Bloom')

            bloomFolder.add( this.bloomParams, 'threshold', -5.0, 5.0 ).onChange( ( value ) => {

                this.bloomPass.threshold = Number( value );

            } );

            bloomFolder.add( this.bloomParams, 'strength', -10.0, 10.0 ).onChange( ( value ) => {

                this.bloomPass.strength = Number( value );

            } );

            bloomFolder.add( this.bloomParams, 'radius', -1.0, 10.0 ).step( 0.01 ).onChange( ( value ) => {

                this.bloomPass.radius = Number( value );

            } );

            const toneMappingFolder = this.debug.ui.addFolder( 'tone mapping' );

            toneMappingFolder.add( this.bloomParams, 'exposure', 0.1, 2 ).onChange( ( value ) => {

                this.outputPass.toneMappingExposure = Math.pow( value, 4.0 );

            } );



            const vignetteFolder = this.debug.ui.addFolder('Vignette')

            vignetteFolder.add( this.vignettePass.uniforms['offset'], 'value')
                .name('offset')
                .min(0)
                .max(10)
                .step(0.01)

            vignetteFolder.add( this.vignettePass.uniforms['darkness'], 'value')
                .name('offset')
                .min(0)
                .max(10)
                .step(0.01)
        }


    }
}
