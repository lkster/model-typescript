type PropertiesKeysOf<T> = {
    [Key in keyof T]:
        T[Key] extends Function ? never : Key;
}[keyof T];

type RawModelPropertiesOf<T, BASE> = {
    [Key in keyof T]:
        T[Key] extends Function ? never :
        T[Key] extends BASE ? ModelPropertiesOf<T[Key], BASE> | T[Key] : T[Key]
};

export type ModelPropertiesOf<T, BASE> = Pick<RawModelPropertiesOf<T, BASE>, PropertiesKeysOf<T>>;
