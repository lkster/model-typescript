import deepClone from 'clone-deep';
import { MODEL_PROPS_METADATA_KEY } from './constants/metadata-keys';
import { IPropertyDeclaration } from './interfaces/property-declaration.interface';
import { PropertyTypeEnum } from './enums/property-type.enum';
import { ObjectUtils } from './utils/object.utils';
import { ModelPropertiesOf } from './types/model-properties-of.type';
import { Model } from './model';
import { PartialModelPropertiesOf } from './types/partial-model-properties-of.type';
import { MutableModel } from '.';


export abstract class ImmutableModel<T> extends Model {

    public constructor(data: ModelPropertiesOf<T, Model>) {
        super();
        this.initModel(data);
        Object.freeze(this);
    }

    public set(data: PartialModelPropertiesOf<T, Model>): T {
        return new (this as any).constructor({
            ...this,
            ...data,
        });
    }

    public clone(): T {
        return this.set({});
    }

    private initModel(data: any): void {
        const properties: IPropertyDeclaration[] = Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, this.constructor);

        for (let declaration of properties) {
            switch (declaration.type) {
                case PropertyTypeEnum.PROPERTY: {
                    this[declaration.key] = ObjectUtils.deepFreeze(deepClone(data[declaration.key]));
                    break;
                }
                
                case PropertyTypeEnum.MODEL_REF: {
                    if (data[declaration.key] instanceof ImmutableModel) {
                        this[declaration.key] = data[declaration.key];
                    } else if (data[declaration.key] instanceof MutableModel) {
                        this[declaration.key] = data[declaration.key].clone().freeze();
                    } else if (declaration.model.prototype instanceof MutableModel) {
                        this[declaration.key] = new (declaration.model as any)(data[declaration.key]);
                        this[declaration.key] = this[declaration.key].freeze();
                    } else {
                        this[declaration.key] = new (declaration.model as any)(data[declaration.key]);
                    }

                    break;
                }
            }
        }
    }
}
