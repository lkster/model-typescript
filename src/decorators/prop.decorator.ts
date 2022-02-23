import { TPropertyKey } from '../types/property-key.type'
import { BasePropDecorator } from './base-prop.decorator';


export function Prop(target: any, key: TPropertyKey): void;
export function Prop(): PropertyDecorator;
export function Prop(target?: any, key?: TPropertyKey): PropertyDecorator | void {
    if (target == null) {
        return (target2: any, key2: TPropertyKey): void => {
            BasePropDecorator(Reflect.getMetadata('design:type', target2, key2) || {})(target2, key2);
        }
    }

    BasePropDecorator(Reflect.getMetadata('design:type', target, key) || {})(target, key);
}
