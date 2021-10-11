import { Mesh, Raycast, Vec2 } from "ogl-typescript";
import { Engine } from "./engine";
import { IRaycastable } from "./IRaycastable";

export class Controls {
    engine: Engine;
    mouse: Vec2;
    raycast: Raycast;
    raycastableMeshes: Array<Mesh>;
    meshDictionary: Map<number, IRaycastable>;

    hoverTarget: number;

    constructor(engine) {
        this.engine = engine;
        this.mouse = new Vec2();
        this.raycast = new Raycast(this.engine.gl);
        this.raycastableMeshes = new Array<Mesh>();
        this.meshDictionary = new Map<number, IRaycastable>();

        document.addEventListener('pointermove', (event) => { this.pointerMove(event) }, false);
        document.addEventListener('pointerdown', (event) => { this.pointerDown(event) }, false);
    }

    addRaycastableMesh(mesh: Mesh, raycastableObject: IRaycastable) {
        this.raycastableMeshes.push(mesh);
        this.meshDictionary.set(mesh.id, raycastableObject);
    }

    pointerMove(event) {
        const hits = this.getRaycastHits(event);

        if (hits.length > 0) {
            const mesh = hits.pop();

            if (this.hoverTarget != mesh.id && this.meshDictionary.has(mesh.id)) {
                if (this.hoverTarget != null) {
                    this.meshDictionary.get(this.hoverTarget).hover(false);
                }

                this.hoverTarget = mesh.id;
                this.meshDictionary.get(this.hoverTarget).hover(true);
            }
        }
        else if (this.hoverTarget != null) {
            this.meshDictionary.get(this.hoverTarget).hover(false);
            this.hoverTarget = null;
        }
    }

    pointerDown(event) {
        const hits = this.getRaycastHits(event);

        if (hits.length > 0) {
            const mesh = hits.pop();
            this.meshDictionary.get(mesh.id).click();
        }
    }

    getRaycastHits(event): Array<Mesh> {
        this.mouse.set(2.0 * (event.x / this.engine.renderer.width) - 1.0, 2.0 * (1.0 - event.y / this.engine.renderer.height) - 1.0);
        this.raycast.castMouse(this.engine.camera, this.mouse);

        return this.raycast.intersectBounds(this.raycastableMeshes);
    }
}