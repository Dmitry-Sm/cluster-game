import {
    Geometry,
    Texture,
    Program,
    Mesh,
    Transform,
    Text,
    Vec4,
    Vec3
} from 'ogl-typescript';

import frag from '../assets/shaders/font_frag.glsl'
import vert from '../assets/shaders/font_vert.glsl'
import fontImage from '../assets/fonts/RightBankFLF.png'
import fontJson from '../assets/fonts/RightBankFLF.json'

const params = {
    colors: {
        default: new Vec4(0.29, 0.28, 0.295, 1.),
        hovered: new Vec4(0.36, 0.21, 0.22, 0.9),
        unactive: new Vec4(0.6, 0.6, 0.6, 0.1)
    },
    scale: new Vec3(0.35, 0.35, 1)
}


export class TextMesh {
    group: Transform;
    mesh: Mesh;

    constructor(engine, text) {
        this.group = new Transform();

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
                uColor: {
                    value: params.colors.default
                }
            },
            transparent: true
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

        this.group.addChild(this.mesh);
        this.mesh.scale.set(params.scale);
    }

    hover(isHoever: boolean) {
        this.mesh.program.uniforms.uColor.value = isHoever ?
            params.colors.hovered :
            params.colors.default;
    }

    setActive(isActive: boolean) {
        this.mesh.program.uniforms.uColor.value = isActive ?
            params.colors.default :
            params.colors.unactive;
    }
}