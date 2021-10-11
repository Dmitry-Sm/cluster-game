import { Board } from "./board";
import { Controls } from "./controls";
import { Engine } from "./engine";

export class Game {
    engine: Engine;
    board: Board;
    controls: Controls;

    constructor(engine) {
        this.engine = engine;
        this.controls = new Controls(engine);
        this.board = new Board(engine, this.controls);
        engine.scene.addChild(this.board.group);
    }
}