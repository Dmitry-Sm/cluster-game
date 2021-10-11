import { Vec2, Vec3 } from 'ogl-typescript';
import { Cell } from "./cell";
import { Neighbors } from './Neighbors';

export class Place {
    index: Vec2;
    position: Vec3;
    cell: Cell;
    neighbors: Neighbors<Place>;

    constructor(index: Vec2) {
        this.index = index;
        this.position = new Vec3(index.x * 1.1, index.y * 1.1, index.y * 0.1);
        this.neighbors = new Neighbors<Place>();
    }
}
