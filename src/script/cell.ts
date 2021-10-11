import {
    Renderer,
    Camera,
    Transform,
    Plane,
    Geometry,
    Program,
    Mesh,
    Vec4,
    Vec3,
    Vec2,
    Texture
} from 'ogl-typescript';
import vertex from '../assets/shaders/cell_vert.glsl'
import fragment from '../assets/shaders/cell_frag.glsl'
import palette from '../assets/images/palette.png'
import { TextMesh } from './textMesh';
import { Neighbors } from './Neighbors';
import { IRaycastable } from './IRaycastable';
import { Cluster } from './Cluster';
import { SmoothValue } from './SmoothValue';
import { Place } from './Place';
import { Board } from './board';
import { Engine } from './engine';

const params = {
    maxValue: 3,
    scale: {
        default: new Vec3(1),
        removed: new Vec3(0.5)
    },
    colors: {
        default: new Vec4(0.2, 0.6, 0, 1.),
        hovered: new Vec4(0.8, 0.6, 0, 0.5),
        clicked: new Vec4(0.2, 0.4, 0.1, 0.0)
    },
    text: {
        position: new Vec3(-0.01, 0.2, 0.1)
    }
}


enum CellState {
    NULL,
    READY,
    ACTIVE,
    REAMOVED
}

export class Cell implements IRaycastable {
    engine: Engine;
    group: Transform;
    mesh: Mesh;
    number: number;
    neighbors: Neighbors<Cell>;
    position: SmoothValue<Vec3>;
    mainColor: SmoothValue<Vec4>;
    scale: SmoothValue;
    brightness: SmoothValue;
    cluster: Cluster;
    place: Place;
    board: Board;
    textMesh: TextMesh;
    originalCluster: Cluster;
    state: CellState;


    constructor(engine: Engine, board: Board) {
        this.engine = engine;
        this.board = board;
        this.group = new Transform();
        this.neighbors = new Neighbors();

        this.mesh = this.createMesh();
        this.group.addChild(this.mesh);
        this.state = CellState.NULL;

        this.initScale(new Vec3().copy(params.scale.default));
        this.initPosition(new Vec3(-10000));
        this.initColor();
        this.update();
    }

    reset() {
        this.number = this.randomNumber(params.maxValue);
        this.scale.setValueImmidietly(new Vec3().copy(params.scale.default));

        this.resetCluster();
        this.updateText();

        this.updateHover(false);
        this.state = CellState.ACTIVE;
    }

    updateText() {
        let s = this.number.toString();

        if (this.textMesh != null) {
            this.textMesh.mesh.setParent(null);
        }

        this.textMesh = new TextMesh(this.engine, s); // create Map<number, texture>
        this.textMesh.mesh.position.set(params.text.position);
        this.group.addChild(this.textMesh.group);
    }

    initPosition(position: Vec3) {
        this.position = new SmoothValue({
            value: position,
            interpolation: (current: Vec3, target: Vec3) => {
                const speed = 0.1;
                current.x -= (current.x - target.x) * speed;
                current.y -= (current.y - target.y) * speed;
                current.z -= (current.z - target.z) * speed;

                this.group.position.set(current.x, current.y, current.z);

                return current;
            },
            complete: (current: Vec3, target: Vec3) => {
                const sum = Math.abs(current.x - target.x) +
                    Math.abs(current.y - target.y) +
                    Math.abs(current.z - target.z);

                return sum < 0.01;
            }
        });
    }

    initScale(scale: Vec3) {
        const startScale = new Vec3().copy(scale);

        this.scale = new SmoothValue({
            value: startScale,
            interpolation: (current: Vec3, target: Vec3) => {
                const speed = 0.05;
                current.x -= (current.x - target.x) * speed;
                current.y -= (current.y - target.y) * speed;
                current.z -= (current.z - target.z) * speed;

                this.group.scale.set(current.x, current.y, current.z);

                return current;
            },
            complete: (current: Vec3, target: Vec3) => {
                const sum = Math.abs(current.x - target.x) +
                    Math.abs(current.y - target.y) +
                    Math.abs(current.z - target.z);

                return sum < 0.01;
            }
        });

        this.scale.setValue(scale);
    }

    createMesh() {
        const geometry = new Plane(this.engine.gl);

        const texture = new Texture(this.engine.gl);
        const img = new Image();
        img.src = palette;
        img.onload = () => (texture.image = img);

        const program = new Program(this.engine.gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: {
                    value: Math.random() * 10
                },
                uRoundness: {
                    value: 12
                },
                uBrightness: {
                    value: 0.5
                },
                uColor: {
                    value: params.colors.default
                },
                uPalette: {
                    value: texture
                }
            },
            transparent: true
        });

        return new Mesh(this.engine.gl, {
            geometry,
            program
        });
    }

    initColor() {
        this.mainColor = new SmoothValue({
            value: new Vec4().copy(params.colors.default),
            interpolation: (current, target) => {
                const speed = 0.1;
                current.x -= (current.x - target.x) * speed;
                current.y -= (current.y - target.y) * speed;
                current.z -= (current.z - target.z) * speed;
                current.w -= (current.w - target.w) * speed;

                this.mesh.program.uniforms.uColor.value = current;
                return current;
            },
            complete: (current: Vec4, target: Vec4) => {
                const sum = Math.abs(current.x - target.x) +
                    Math.abs(current.y - target.y) +
                    Math.abs(current.z - target.z) +
                    Math.abs(current.w - target.w);

                return sum < 0.01;
            }
        });
        this.brightness = new SmoothValue({
            value: 0.5,
            interpolation: (current: number, target: number) => {
                const speed = 0.1;
                current -= (current - target) * speed;

                this.mesh.program.uniforms.uBrightness.value = current;
                return current;
            },
            complete: (current: number, target: number) => {
                const sum = Math.abs(current - target);

                return sum < 0.01;
            }
        });
    }

    randomNumber(max: number): number {
        return Math.floor(Math.random() * max);
    }

    update() {
        requestAnimationFrame(() => { this.update() });
        this.mesh.program.uniforms.uTime.value += 0.1;
    }

    hover(isHovered: boolean) {
        if (this.state != CellState.ACTIVE) {
            return;
        }

        if (this.cluster.cells.length >= 3) {
            this.cluster.cells.forEach(cell => {
                cell.updateHover(isHovered);
            });
        }
    }

    click() {
        if (this.state != CellState.ACTIVE) {
            return;
        }

        if (this.cluster.cells.length >= 3) {
            this.board.removeCluster(this.cluster);
        }
    }

    remove() {
        this.state = CellState.REAMOVED;
        this.place.cell = null;

        this.scale.setValue(new Vec3().copy(params.scale.removed));
        this.brightness.setValue(-1, (value) => {
            this.position.setValueImmidietly(new Vec3(-10000));
        });
        this.textMesh.setActive(false);
    }

    updateHover(isHovered: boolean) {
        this.brightness.setValue(isHovered ? 1 : 0);
        this.textMesh.hover(isHovered);
    }

    updateClick() {
        this.mainColor.setValue(params.colors.clicked);
        this.remove();
    }

    resetCluster() {
        this.cluster = new Cluster();
        this.cluster.addCell(this);
    }
}