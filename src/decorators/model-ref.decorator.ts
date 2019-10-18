import { BasePropDecorator } from './base-prop.decorator';


export function ModelRef(model: any): PropertyDecorator {
    return BasePropDecorator(model);
}
