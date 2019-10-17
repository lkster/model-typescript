import { TPropertyKey } from '@/types/property-key.type';
import { PropertyTypeEnum } from '@/enums/property-type.enum';


export interface IPropertyDeclaration {
    key: TPropertyKey;
    type: PropertyTypeEnum;
}
