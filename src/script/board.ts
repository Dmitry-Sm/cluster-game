import { Cell } from "./cell";

const params = {
    size: {
        width: 4,
        height: 5
    }
}

export class Board {
    engine;
    size;
    cells;

    constructor(engine) {
        this.size = params.size;
        this.cells = new Array();

        for (let x = 0; x < params.size.width; x++) {
            this.cells[x] = new Array();

            for (let y = 0; y < params.size.height; y++) {
                const cell = new Cell(engine, {
                    position: this.cellPositionById({ x, y })
                });
                this.cells[x].push(cell);
            }
        }
    }

    cellPositionById(id) {
        return {
            x: id.x - params.size.width / 2,
            y: id.y - params.size.height / 2
        };
    }
}