import {
    Renderer,
    Camera,
    Transform,
    Geometry,
    Program,
    Mesh
} from 'ogl-typescript';
import vertex from '../assets/shaders/cell_vert.glsl'
import fragment from '../assets/shaders/cell_frag.glsl'
import { TextMesh } from './textMesh';

const geometryData = {
    position: {
        size: 3,
        data: new Float32Array([-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0])
    },
    uv: {
        size: 2,
        data: new Float32Array([0, 1, 1, 1, 0, 0, 1, 0])
    },
    index: {
        data: new Uint16Array([0, 1, 2, 1, 3, 2])
    },
}


export class Cell {
    engine;
    mesh;

    constructor(engine, { position }) {
        // Geometry is an indexed square, comprised of 4 vertices.
        const geometry = new Geometry(engine.gl, geometryData);

        const program = new Program(engine.gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: {
                    value: 0
                },
            },
        });

        this.mesh = new Mesh(engine.gl, {
            geometry,
            program
        });
        this.mesh.setParent(engine.scene);

        const fontMesh = new TextMesh(engine, this.randomNumber());
        this.mesh.position.set(position.x * 2, position.y * 2, 0);
        this.mesh.addChild(fontMesh.mesh);
        fontMesh.mesh.position.set(0, 0.45, 0.5);
    }

    randomNumber() {
        const r = Math.random();
        return r < 0.333 ? '0' : r < 0.6666 ? '1' : '2';
    }
}