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
    static image = new Image();

    constructor(engine) {
        const texture = new Texture(engine.gl, {
            generateMipmaps: false,
        });

        TextMesh.image.onload = () => (texture.image = TextMesh.image);
        TextMesh.image.src = fontImage;

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

        const text = new Text({
            font: fontJson,
            text: "0 1 2 3 4",
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
                data: text.buffers.position
            },
            uv: {
                size: 2,
                data: text.buffers.uv
            },
            // id provides a per-character index, for effects that may require it
            id: {
                size: 1,
                data: text.buffers.id
            },
            index: {
                data: text.buffers.index
            },
        });

        const mesh = new Mesh(engine.gl, {
            geometry,
            program
        });

        // Use the height value to position text vertically. Here it is centered.
        mesh.position.y = text.height * 0.5;
        mesh.setParent(engine.scene);
    }
}