import {
    Renderer,
    Camera,
    Transform,
    Geometry,
    Program,
    Mesh,
    Vec4,
    Plane,
    Vec2,
    Vec3,
    Texture
} from 'ogl-typescript';
import vertex from '../assets/shaders/board_vert.glsl'
import fragment from '../assets/shaders/board_frag.glsl'
import { Cell } from "./cell";
import { Controls } from './controls';
import { Cluster } from './Cluster';
import { Place } from './Place';
import { DataPool } from './dataPool';
import { Engine } from './engine';


const params = {
    colors: {
        default: new Vec4(0.25, 0.12, 0.04, 1)
    },
    mesh: {
        textureSize: new Vec2(512, 512),
        depth: -1,
        padding: 4
    },
    size: {
        width: 5,
        height: 4
    },
    pauses: {
        cellFallDelay: 600,
        cellCreateDelay: 600
    }
}


export class Board {
    engine: Engine;
    group: Transform;
    mesh: Mesh;
    cellPool: DataPool<Cell>;
    places: Array<Array<Place>>;
    controls: Controls;

    constructor(engine: Engine, controls: Controls) {
        this.controls = controls;
        this.engine = engine;
        this.group = new Transform();
        const scale = 5.5 / Math.max(params.size.width, params.size.height);
        this.group.scale.multiply(scale);
        this.group.position.set(-(params.size.width - 1) / 2 * scale,
            -(params.size.height - 1) / 2 * scale, 0);
        this.mesh = this.createMesh();
        this.mesh.position.set((params.size.width - 1) / 2, (params.size.height - 1) / 2, params.mesh.depth);
        this.group.addChild(this.mesh);
        this.createPlaces();
        this.createCellPool();
        this.createCells();
        this.updateCellNeighbors();
        this.findClusters(this.places);

        this.update();
    }

    createPlaces() {
        this.places = new Array<Array<Place>>();

        for (let x = 0; x < params.size.width; x++) {
            let place: Place, leftPlace: Place, bottomPlace: Place;
            this.places[x] = new Array<Place>();

            for (let y = 0; y < params.size.height; y++) {
                place = new Place(new Vec2(x, y));

                if (x > 0) {
                    leftPlace = this.places[x - 1][y];
                    place.neighbors.left = leftPlace;
                    leftPlace.neighbors.right = place;
                }

                if (y > 0) {
                    bottomPlace = this.places[x][y - 1];
                    place.neighbors.bottom = bottomPlace;
                    bottomPlace.neighbors.top = place;
                }

                this.places[x].push(place);
            }
        }
    }

    createCellPool() {
        this.cellPool = new DataPool<Cell>(() => {
            const cell = new Cell(this.engine, this);

            this.group.addChild(cell.group);
            this.controls.addRaycastableMesh(cell.mesh, cell);

            return cell;
        });
        this.cellPool.createPool(params.size.width * params.size.height * 2)
    }

    createCells() {
        for (let x = 0; x < params.size.width; x++) {
            for (let y = 0; y < params.size.height; y++) {
                this.createCell(this.places[x][y]);
            }
        }
    }

    fillPlaces(places: Array<Place>) {
        places.forEach(place => {
            this.createCell(place);
        });
    }

    createCell(place: Place): Cell {
        const cell = this.cellPool.pop();
        cell.reset();
        cell.place = place;
        place.cell = cell;

        const startPosition = new Vec3().copy(place.position);
        startPosition.y += 0.4;
        cell.position.setValueImmidietly(startPosition);
        cell.position.setValue(place.position);

        return cell;
    }

    createMesh() {
        const geometry = new Plane(this.engine.gl, {
            width: params.size.width + params.mesh.padding,
            height: params.size.height + params.mesh.padding
        });

        const program = new Program(this.engine.gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: {
                    value: 0
                },
                uResolution: {
                    value: params.mesh.textureSize
                },
                uColor: {
                    value: params.colors.default
                },
                tMap: {
                    value: this.engine.textureTarget.texture
                }
            }
        });

        return new Mesh(this.engine.gl, {
            geometry,
            program
        });
    }

    findClusters(places: Array<Array<Place>>): Array<Cluster> {
        const clusters = new Array<Cluster>();
        let cell: Cell, top, right;

        for (let x = 0; x < places.length; x++) {
            for (let y = 0; y < places[x].length; y++) {
                cell = places[x][y].cell;
                top = cell.neighbors.top;
                right = cell.neighbors.right;

                if (top != null && cell.number === top.number) {
                    cell.cluster.combine(top.cluster);
                }

                if (right != null && cell.number === right.number) {
                    cell.cluster.combine(right.cluster);
                }
            }
        }

        return clusters;
    }

    removeCluster(cluster: Cluster) {
        cluster.cells.forEach(cell => {
            this.cellPool.push(cell);
            cell.remove();
        });

        setTimeout(() => {
            this.updateCells();
        }, params.pauses.cellFallDelay);
    }

    updateCells() {
        const emptyPlaces = new Array<Place>();

        for (let x = 0; x < this.places.length; x++) {
            const columnCells = Array<Cell>();

            for (let y = 0; y < this.places[x].length; y++) {
                const place = this.places[x][y];

                if (place.cell != null) {
                    columnCells.push(place.cell)
                }
            }

            for (let y = 0; y < this.places[x].length; y++) {
                const place = this.places[x][y];

                if (columnCells.length > 0) {
                    const cell = columnCells.shift();
                    place.cell = cell;
                    cell.place = place;
                    cell.position.setValue(place.position);
                    cell.resetCluster();
                }
                else {
                    emptyPlaces.push(place);
                }
            }
        }

        setTimeout(() => {
            this.fillPlaces(emptyPlaces);
            this.updateCellNeighbors();
            this.findClusters(this.places);
        }, params.pauses.cellCreateDelay);
    }

    update() {
        this.mesh.program.uniforms.uTime.value += 1;
        this.mesh.program.uniforms.uResolution.value = this.engine.resolution.value;

        requestAnimationFrame(() => { this.update() });
    }

    updateCellNeighbors() {
        for (let x = 0; x < this.places.length; x++) {
            for (let y = 0; y < this.places[x].length; y++) {
                const neighbors = this.places[x][y].neighbors;
                const cell = this.places[x][y].cell;

                cell.neighbors.top = neighbors.top?.cell;
                cell.neighbors.right = neighbors.right?.cell;
                cell.neighbors.bottom = neighbors.bottom?.cell;
                cell.neighbors.left = neighbors.left?.cell;
            }
        }
    }
}