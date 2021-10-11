export class DataPool<T> {
    initFunc: () => T;
    pool: Array<T>;

    constructor(initFunc: () => T) {
        this.initFunc = initFunc;
    }

    createPool(num: number) {
        if (this.pool == null) {
            this.pool = new Array<T>();
        }
        else {
            this.pool.length = 0;
        }

        for (let i = 0; i < num; i++) {
            this.pool.push(this.initFunc());
        }
    }

    push(obj: T) {
        this.pool.push(obj);
    }

    pop(): T {
        return this.pool.pop();
    }
}