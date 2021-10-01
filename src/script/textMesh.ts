import {
    Geometry,
    Texture,
    Program,
    Mesh,
    Text
} from 'ogl-typescript';

import frag from '../assets/shaders/font_frag.glsl'
import vert from '../assets/shaders/font_vert.glsl'
import fontImage from '../assets/fonts/RightBankFLF.png'
import fontJson from '../assets/fonts/RightBankFLF.json'


export class TextMesh {

    mesh;

    constructor(engine, text) {
        const texture = new Texture(engine.gl, {
            generateMipmaps: false,
        });

        const image = new Image();
        image.onload = () => (texture.image = image);
        image.src = fontImage;

        const program = new Program(engine.gl, {
            vertex: vert,
            fragment: frag,
            uniforms: {
                tMap: {
                    value: texture
                },
            },
            transparent: true,
            cullFace: null,
            depthWrite: false,
        });

        const textObject = new Text({
            font: fontJson,
            text,
            width: 4,
            align: 'center',
            letterSpacing: -0.05,
            size: 1,
            lineHeight: 1.1,
        });

        // Pass the generated buffers into a geometry
        const geometry = new Geometry(engine.gl, {
            position: {
                size: 3,
                data: textObject.buffers.position
            },
            uv: {
                size: 2,
                data: textObject.buffers.uv
            },
            // id provides a per-character index, for effects that may require it
            id: {
                size: 1,
                data: textObject.buffers.id
            },
            index: {
                data: textObject.buffers.index
            },
        });

        this.mesh = new Mesh(engine.gl, {
            geometry,
            program
        });

        this.mesh.scale.set(0.8, 0.8, 1);
    }
}