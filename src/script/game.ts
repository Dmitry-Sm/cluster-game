import { Board } from "./board";

export class Game {
    engine;
    board;

    constructor(engine) {
        this.board = new Board(engine);
    }
}