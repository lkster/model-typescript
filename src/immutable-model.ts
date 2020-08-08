import deepClone from 'clone-deep';
import { IPropertyDeclaration } from './interfaces/property-declaration.interface';
import { PropertyTypeEnum } from './enums/property-type.enum';
import { ObjectUtils } from './utils/object.utils';
import { ModelPropertiesOf } from './types/model-properties-of.type';
import { Model } from './model';
import { PartialModelPropertiesOf } from './types/partial-model-properties-of.type';
import { MutableModel } from '.';


export abstract class ImmutableModel<T> extends Model<T> {

    public constructor(data: ModelPropertiesOf<T, Model<any>>) {
        super(data);
        Object.freeze(this);
    }

    public set(data: PartialModelPropertiesOf<T, Model<any>>): T {
        return new (this as any).constructor({
            ...this,
            ...data,
        });
    }

    public clone(): T {
        return this.set({});
    }

    protected defineProperty(propertyMetadata: IPropertyDeclaration, value: any): void {
        switch (propertyMetadata.type) {
            case PropertyTypeEnum.PROPERTY: {
                this[propertyMetadata.key] = ObjectUtils.deepFreeze(deepClone(value));
                break;
            }
            
            case PropertyTypeEnum.MODEL_REF: {
                if (value instanceof ImmutableModel) {
                    this[propertyMetadata.key] = value;
                } else if (value instanceof MutableModel) {
                    this[propertyMetadata.key] = value.clone().freeze();
                } else if (propertyMetadata.model.prototype instanceof MutableModel) {
                    this[propertyMetadata.key] = new (propertyMetadata.model as any)(value);
                    this[propertyMetadata.key] = this[propertyMetadata.key].freeze();
                } else if (ObjectUtils.isPlainObject(value)) {
                    this[propertyMetadata.key] = new (propertyMetadata.model as any)(value);
                } else {
                    this[propertyMetadata.key] = value;
                }

                break;
            }
        }
    }
}
