import {
    Renderer,
    Camera,
    Transform,
    Orbit,
    Post,
    Vec2,
    RenderTarget,
    Pass,
    OGLRenderingContext,
    Vec3
} from 'ogl-typescript';

import fragment from '../assets/shaders/post_frag.glsl'
import { Controls } from './controls';

const params = {
    textureSize: {
        width: 512,
        height: 512
    },
    camera: {
        fov: 10,
        position: new Vec3(0, 0, 40)
    }
}

export class Engine {
    renderer: Renderer;
    gl: OGLRenderingContext;
    scene: Transform;
    textureTarget: RenderTarget;
    camera: Camera;
    controls: Controls;
    post: Post;
    pass: Pass;
    resolution: { value };

    constructor() {
        this.renderer = new Renderer({
            canvas: document.querySelector('.main-canvas'),
            dpr: 2
        });

        this.gl = this.renderer.gl;

        this.post = new Post(this.gl);
        this.resolution = { value: new Vec2(this.gl.canvas.width, this.gl.canvas.height) };
        this.pass = this.post.addPass({
            fragment,
            uniforms: {
                uResolution: this.resolution,
                uBlurStep: {
                    value: 1
                },
                uTime: {
                    value: 1
                }
            },
        });

        this.scene = new Transform();
        this.textureTarget = new RenderTarget(this.gl, params.textureSize);

        this.camera = new Camera(this.gl, {
            fov: params.camera.fov
        });
        this.camera.position.set(params.camera.position);

        // this.controls = new Orbit(this.camera);

        window.addEventListener('resize', () => { this.resize() }, false);
        this.resize();
        this.update();
    }

    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.perspective({
            aspect: this.gl.canvas.width / this.gl.canvas.height
        });

        this.post.resize();
        this.resolution.value.set(this.gl.canvas.width, this.gl.canvas.height);
    }

    update() {
        requestAnimationFrame(() => { this.update() });

        // this.controls.update();

        this.pass.uniforms.uBlurStep.value -= 0.01;
        this.pass.uniforms.uTime.value += 0.02;

        this.post.render({
            scene: this.scene,
            camera: this.camera,
            target: this.textureTarget
        })

        this.post.render({
            scene: this.scene,
            camera: this.camera,
        });
    }
}