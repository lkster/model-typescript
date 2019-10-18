/// <reference types="reflect-metadata" />

import { MODEL_PROPS_METADATA_KEY } from '../../src/constants/metadata-keys';
import { ImmutableModel } from '../../src/immutable-model';
import { PropertyTypeEnum } from '../../src/enums/property-type.enum';
import { BasePropDecorator } from '../../src/decorators/base-prop.decorator';


describe('BaseProp decorator', () => {
    
    describe('assigning array to store data in metadata', () => {
            
        class mockClass {}
        const mockKey = 'some key';

        it('should assign new array to class metadata if there are not any assigned yet', () => {
            Reflect.defineMetadata(MODEL_PROPS_METADATA_KEY, undefined, mockClass);
            BasePropDecorator({} as any)(new mockClass(), mockKey);

            expect(Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, mockClass)).toBeInstanceOf(Array);
        });

        it('should push new value to actually existing array in class metadata', () => {
            const arr = [];
            Reflect.defineMetadata(MODEL_PROPS_METADATA_KEY, arr, mockClass);

            BasePropDecorator({} as any)(new mockClass(), mockKey);

            expect(Reflect.getMetadata(MODEL_PROPS_METADATA_KEY, mockClass)).toBe(arr);
        });
    });

    describe('assigning metadata', () => {
        
        class mockClass {};
        class TestModel extends ImmutableModel<TestModel> {}
        const mockKey = 'some key';

        it('should add property declaration for property', () => {
            const arr = [];
            Reflect.defineMetadata(MODEL_PROPS_METADATA_KEY, arr, mockClass);
            
            BasePropDecorator({} as any)(new mockClass(), mockKey);

            expect(arr[0]).toEqual({
                key: 'some key',
                type: PropertyTypeEnum.PROPERTY,
            });
        });

        it('should add property declaration for model reference if emitDecoratorMetadata is enabled', () => {
            const arr = [];
            const instance = new mockClass();

            Reflect.defineMetadata(MODEL_PROPS_METADATA_KEY, arr, mockClass);

            BasePropDecorator(TestModel)(instance, mockKey);

            expect(arr[0]).toEqual({
                key: 'some key',
                type: PropertyTypeEnum.MODEL_REF,
                model: TestModel,
            });
        });
    });
});
