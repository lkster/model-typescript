import { TPropertyKey } from '../types/property-key.type';
import { PropertyTypeEnum } from '../enums/property-type.enum';
import { ImmutableModel } from '../immutable-model';


export interface IPropertyDeclaration {
    key: TPropertyKey;
    type: PropertyTypeEnum;
    model?: typeof ImmutableModel;
}
