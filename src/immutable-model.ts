import deepClone from 'clone-deep';
import { MODEL_PROPS_METADATA_KEY } from './constants/metadata-keys';
import { IPropertyDeclaration } from './interfaces/property-declaration.interface';
import { PropertyTypeEnum } from './enums/property-type.enum';
import { ObjectUtils } from './utils/object.utils';


export abstract class ImmutableModel<T> {

    public constructor(data: any) {
        this.initModel(data);
        Object.freeze(this);
    }

    public set(data: any): T {
        return new (this as any).constructor({
            ...this,
            ...data,
        });
    }

    public clone(): T {
        return this.set({});
    }

    private initModel(data: any): void {
        const properties: IPropertyDeclaration[] = Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, (this as any).constructor);

        for (let declaration of properties) {
            switch (declaration.type) {
                case PropertyTypeEnum.PROPERTY: {
                    this[declaration.key] = ObjectUtils.deepFreeze(deepClone(data[declaration.key]));
                    break;
                }
            }
        }
    }
}