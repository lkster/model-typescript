import util from 'util';
import { MODEL_PROPS_METADATA_KEY } from '../constants/metadata-keys'
import { TPropertyKey } from '../types/property-key.type'
import { PropertyTypeEnum } from '../enums/property-type.enum';
import { IPropertyDeclaration } from '../interfaces/property-declaration.interface';
import { ImmutableModel } from '../immutable-model';


function propDecorator(target: any, key: TPropertyKey): void {
    let props: IPropertyDeclaration[] = Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, target.constructor);
    const type = Reflect.getMetadata('design:type', target, key);

    let propertyDeclaration: IPropertyDeclaration;
    
    if (type.prototype instanceof ImmutableModel) {
        propertyDeclaration = {
            key,
            type: PropertyTypeEnum.MODEL_REF,
            model: type as any,
        };
    } else {
        propertyDeclaration = {
            key,
            type: PropertyTypeEnum.PROPERTY,
        }
    }

    if (util.isArray(props)) {
        props.push(propertyDeclaration);
    } else {
        props = [propertyDeclaration];
        Reflect.defineMetadata(MODEL_PROPS_METADATA_KEY, props, target.constructor);
    }
}

export function Prop(target: any, key: TPropertyKey): void;
export function Prop(): PropertyDecorator;
export function Prop(target?: any, key?: TPropertyKey): PropertyDecorator | void {
    if (util.isNullOrUndefined(target)) {
        return propDecorator;
    }

    propDecorator(target, key);
}
