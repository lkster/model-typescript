import { Model } from '../model';
import { PropertiesKeysOf } from './properties-keys-of.type';


type RawPartialModelPropertiesOf<T, BASE> = Partial<{
    [Key in keyof T]:
        T[Key] extends Function ? never :
        T[Key] extends BASE ? RawPartialModelPropertiesOf<T[Key], BASE> | T[Key] : T[Key]
}>;

export type PartialModelPropertiesOf<T, BASE = Model> = Partial<Pick<RawPartialModelPropertiesOf<T, BASE>, PropertiesKeysOf<T>>>;
