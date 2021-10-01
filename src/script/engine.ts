import {
    Renderer,
    Camera,
    Transform,
    Orbit
} from 'ogl-typescript';


export class Engine {
    renderer;
    gl;
    scene;
    camera;
    controls;

    constructor() {
        this.renderer = new Renderer({
            dpr: 2
        });
        this.gl = this.renderer.gl;
        document.body.appendChild(this.gl.canvas);
        this.gl.clearColor(1, 1, 1, 1);

        this.scene = new Transform();

        this.camera = new Camera(this.gl, {
            fov: 20
        });
        this.camera.position.set(0, 0, 100);

        this.controls = new Orbit(this.camera);

        window.addEventListener('resize', this.resize, false);
        this.resize();
        this.update();
    }

    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.perspective({
            aspect: this.gl.canvas.width / this.gl.canvas.height
        });
    }

    update() {
        requestAnimationFrame(() => { this.update() });

        this.controls.update();
        this.renderer.render({
            scene: this.scene,
            camera: this.camera
        });
    }
}