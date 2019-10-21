import { ModelPropertiesOf } from './types/model-properties-of.type';
import { IPropertyDeclaration } from './interfaces/property-declaration.interface';
import { MODEL_PROPS_METADATA_KEY } from './constants/metadata-keys';

export abstract class Model<T> {
 
    public constructor(data: ModelPropertiesOf<T, Model<any>>) {
        this.initModel(data);
    }

    protected abstract defineProperty(propertyMetadata: IPropertyDeclaration, value: any): void;

    private initModel(data: ModelPropertiesOf<T, Model<any>>): void {
        const properties: IPropertyDeclaration[] = Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, this.constructor);

        for (let declaration of properties) {
            this.defineProperty(declaration, data[declaration.key]);
        }
    }
}
