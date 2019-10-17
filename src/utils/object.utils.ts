import util from 'util';

export class ObjectUtils {

    // https://stackoverflow.com/questions/1173549/how-to-determine-if-an-object-is-an-object-literal-in-javascript/1482209#1482209
    public static isPlainObject(object: any): boolean {
        if (typeof object !== 'object' || object === null) {
            return false;
        }
        
        let _obj = object;

        while (true) {
            _obj = Object.getPrototypeOf(_obj);
            
            if (Object.getPrototypeOf(_obj) === null) {
                break;
            }
        }
        
        return Object.getPrototypeOf(object) === _obj;
    }

    public static deepFreeze<T extends Object>(object: T): T {
        if (this.isPlainObject(object)) {
            Object.freeze(object);

            const entries = Object.entries(object);

            for (const [key, value] of entries) {
                if (
                    object.hasOwnProperty(key)
                    && value != null
                    && !Object.isFrozen(value)
                ) {
                    this.deepFreeze(value);
                }
            }

            return object;
        } else if (util.isArray(object)) {
            Object.freeze(object);

            for (const value of object) {
                if (
                    value != null
                    && !Object.isFrozen(value)
                ) {
                    this.deepFreeze(value);
                } 
            }
        }

        return object;
    }
}