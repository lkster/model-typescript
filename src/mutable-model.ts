import util from 'util';
import deepCloneFn from 'clone-deep';
import { ModelPropertiesOf } from './types/model-properties-of.type';
import { IPropertyDeclaration } from './interfaces/property-declaration.interface';
import { MODEL_PROPS_METADATA_KEY } from './constants/metadata-keys';
import { PropertyTypeEnum } from './enums/property-type.enum';
import { Model } from './model';
import { ImmutableModel } from './immutable-model';
import { PartialModelPropertiesOf } from './types/partial-model-properties-of.type';
import { ObjectUtils } from './utils/object.utils';


export abstract class MutableModel<T> extends Model<any> {

    public set(data: PartialModelPropertiesOf<T, Model<any>>): this {
        if (Object.isFrozen(this)) {
            return this;
        }

        const properties: IPropertyDeclaration[] = Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, this.constructor);

        for (let declaration of properties) {
            if (util.isNullOrUndefined(data[declaration.key])) {
                continue;
            }

            this.defineProperty(declaration, data[declaration.key]);
        }
        return this;
    }

    public clone(deepClone: boolean = false): T {
        // TODO: if model is frozen, deepClone should be the only option here
        
        if (!deepClone) {
            return new (this.constructor as any)(this);
        }

        const newData: ModelPropertiesOf<T, Model<any>> = {} as any;

        const properties: IPropertyDeclaration[] = Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, this.constructor);

        for (let declaration of properties) {
            newData[declaration.key] = this.cloneProperty(declaration, this[declaration.key]);
        }

        return new (this.constructor as any)(newData);
    }

    public freeze(): this {
        const properties: IPropertyDeclaration[] = Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, this.constructor);

        for (let declaration of properties) {
            this[declaration.key] = this.cloneProperty(declaration, this[declaration.key]);
            this.freezeProperty(declaration, this[declaration.key]);            
        }

        Object.freeze(this);

        return this;
    }

    public isFrozen(): boolean {
        return Object.isFrozen(this);
    }

    protected cloneProperty(propertyMetadata: IPropertyDeclaration, value: any): any {
        switch (propertyMetadata.type) {
            case PropertyTypeEnum.PROPERTY: {
                return deepCloneFn(value);
            }
            
            case PropertyTypeEnum.MODEL_REF: {
                if (value instanceof MutableModel) {
                    return value.clone(true);
                } else {
                    return value.clone();
                }
            }
        }
    }

    protected freezeProperty(propertyMetadata: IPropertyDeclaration, value: any): void {
        switch (propertyMetadata.type) {
            case PropertyTypeEnum.PROPERTY: {
                ObjectUtils.deepFreeze(value);
            }
            
            case PropertyTypeEnum.MODEL_REF: {
                if (value instanceof MutableModel) {
                    value.freeze();
                }
            }
        }
    }

    protected defineProperty(propertyMetadata: IPropertyDeclaration, value: any): void {
        switch (propertyMetadata.type) {
            case PropertyTypeEnum.PROPERTY: {
                this[propertyMetadata.key] = value;
                break;
            }
            
            case PropertyTypeEnum.MODEL_REF: {
                if (value instanceof Model) {
                    this[propertyMetadata.key] = value;
                } else if (this[propertyMetadata.key] instanceof MutableModel) {
                    this[propertyMetadata.key].set(value);
                } else if (this[propertyMetadata.key] instanceof ImmutableModel) {
                    this[propertyMetadata.key] = this[propertyMetadata.key].set(value);
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
