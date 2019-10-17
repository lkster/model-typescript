import { TPropertyKey } from '@/types/property-key.type';
import { PropertyTypeEnum } from '@/enums/property-type.enum';
import { ImmutableModel } from '@/immutable-model';

// https://stackoverflow.com/a/52358194/3788615
type TypeOfImmutableModel = typeof ImmutableModel;

interface ImmutableModelDerived extends TypeOfImmutableModel {}

export interface IPropertyDeclaration {
    key: TPropertyKey;
    type: PropertyTypeEnum;
    model?: ImmutableModelDerived;
}
