import { MODEL_PROPS_METADATA_KEY } from './constants/metadata-keys';
import { IPropertyDeclaration } from './interfaces/property-declaration.interface';
import { PropertyTypeEnum } from './enums/property-type.enum';

export abstract class ImmutableModel<T> {

    public constructor(data: any) {
        this.initModel(data);
        Object.freeze(this);
    }

    private initModel(data: any): void {
        const properties: IPropertyDeclaration[] = Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, (this as any).constructor);

        for (let declaration of properties) {
            switch (declaration.type) {
                case PropertyTypeEnum.PROPERTY: {
                    this[declaration.key] = data[declaration.key];
                    break;
                }
            }
        }
    }
}