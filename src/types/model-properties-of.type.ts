import { Model } from '../model';
import { PropertiesKeysOf } from './properties-keys-of.type';

type RawModelPropertiesOf<T, BASE> = {
    [Key in keyof T]:
        T[Key] extends Function ? never :
        T[Key] extends BASE ? ModelPropertiesOf<T[Key], BASE> | T[Key] : T[Key]
};

export type ModelPropertiesOf<T, BASE = Model<any>> = Pick<RawModelPropertiesOf<T, BASE>, PropertiesKeysOf<T>>;
