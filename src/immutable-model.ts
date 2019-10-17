import deepClone from 'clone-deep';
import { MODEL_PROPS_METADATA_KEY } from './constants/metadata-keys';
import { IPropertyDeclaration } from './interfaces/property-declaration.interface';
import { PropertyTypeEnum } from './enums/property-type.enum';
import { ObjectUtils } from './utils/object.utils';
import { ModelPropertiesOf } from './types/model-properties-of.type';


export abstract class ImmutableModel<T> {

    public constructor(data: ModelPropertiesOf<T, ImmutableModel<any>>) {
        this.initModel(data);
        Object.freeze(this);
    }

    public set(data: Partial<ModelPropertiesOf<T, ImmutableModel<any>>>): T {
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
                    } else {
                        this[declaration.key] = new declaration.model(data[declaration.key]);
                    }

                    break;
                }
            }
        }
    }
}