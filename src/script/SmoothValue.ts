
type interpolationFunction = (current: any, target: any) => any;
type onEndCallbackFunction = (current: any) => any;
type completeCheckFunction = (current: any, target: any) => boolean;

export class SmoothValue<T = any> {
    current: T;
    target: T;
    onEndCallback: (T) => void;
    interpolation: interpolationFunction;
    complete: completeCheckFunction;

    constructor({ value, interpolation, complete }) {
        this.current = value;
        this.target = value;
        this.complete = complete;
        this.interpolation = interpolation;

        this.current = this.interpolation(this.current, this.target);
    }

    setValue(newValue: T, onEndCallback: (T) => void = null) {
        this.target = newValue;
        this.onEndCallback = onEndCallback;
        this.update();
    }

    setValueImmidietly(newValue: T) {
        this.target = newValue;
        this.current = newValue;
        this.update();
    }

    update() {
        this.current = this.interpolation(this.current, this.target);

        if (this.complete(this.current, this.target)) {
            if (this.onEndCallback != null) {
                this.onEndCallback(this.current);
            }

            return;
        }

        requestAnimationFrame(() => { this.update(); });
    }
}
