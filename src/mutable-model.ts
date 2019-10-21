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


export abstract class MutableModel<T> extends Model {

    public constructor(data: ModelPropertiesOf<T, Model>) {
        super();
        this.initModel(data);
    }

    public set(data: PartialModelPropertiesOf<T, Model>): this {
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
        if (!deepClone) {
            return new (this.constructor as any)(this);
        }

        const newData: ModelPropertiesOf<T, Model> = {} as any;

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

    private initModel(data: ModelPropertiesOf<T, Model>): void {
        const properties: IPropertyDeclaration[] = Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, this.constructor);

        for (let declaration of properties) {
            this.defineProperty(declaration, data[declaration.key]);
        }
    }

    private cloneProperty(propertyMetadata: IPropertyDeclaration, value: any): any {
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

    private freezeProperty(propertyMetadata: IPropertyDeclaration, value: any): void {
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

    private defineProperty(propertyMetadata: IPropertyDeclaration, value: any): void {
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
                } else {
                    this[propertyMetadata.key] = new (propertyMetadata.model as any)(value);
                }

                break;
            }
        }
    }
}
