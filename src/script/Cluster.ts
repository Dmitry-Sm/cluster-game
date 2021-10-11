import { Cell } from "./cell";

export class Cluster {
    cells: Array<Cell>;

    constructor() {
        this.cells = new Array<Cell>();
    }

    addCell(cellToAdd: Cell) {
        if (!this.cells.includes(cellToAdd)) {
            this.cells.push(cellToAdd);
        }
    }

    addCells(cellsToAdd: Array<Cell>) {
        cellsToAdd.forEach(cell => {
            this.addCell(cell);
        });
    }

    combine(cluster: Cluster) {
        cluster.cells.forEach(cell => {
            cell.cluster = this;
            this.addCell(cell);
        });
    }
}
