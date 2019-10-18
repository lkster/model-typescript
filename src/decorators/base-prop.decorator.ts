import util from 'util';
import { TPropertyKey } from '../types/property-key.type';
import { IPropertyDeclaration } from '../interfaces/property-declaration.interface';
import { MODEL_PROPS_METADATA_KEY } from '../constants/metadata-keys';
import { ImmutableModel } from '..';
import { PropertyTypeEnum } from '../enums/property-type.enum';


export function BasePropDecorator(model: any): PropertyDecorator {

    return (target: any, key: TPropertyKey): void => {
        let props: IPropertyDeclaration[] = Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, target.constructor);

        let propertyDeclaration: IPropertyDeclaration;
        
        if (model.prototype instanceof ImmutableModel) {
            propertyDeclaration = {
                key,
                model,
                type: PropertyTypeEnum.MODEL_REF,
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
}
