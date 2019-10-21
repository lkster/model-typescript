/// <reference types="reflect-metadata" />

import * as BasePropDecoratorModule from '../../src/decorators/base-prop.decorator';
import { ImmutableModel, Prop } from '../../src';

describe('Prop decorator', () => {
    
    class TestModel extends ImmutableModel<TestModel> {}

    const decorator = jest.fn();

    beforeEach(() => {
        (BasePropDecoratorModule as any).BasePropDecorator = jest.fn(x => decorator) as any;
    });

    describe('target and key provided', () => {
        
        it('should call BasePropDecorator with data from design:type metadata', () => {
            const target = class Target {};
            const key = 'some key';
            Reflect.defineMetadata('design:type', 'some type', target, key);

            Prop(target, key);

            expect(BasePropDecoratorModule.BasePropDecorator).toHaveBeenCalledWith('some type');
        });

        it('should call BasePropDecorator with empty object if design:type metadata is empty', () => {
            const target = class Target {};
            const key = 'some key';

            Prop(target, key);

            expect(BasePropDecoratorModule.BasePropDecorator).toHaveBeenCalledWith({});
        });

        it('should call returned by BasePropDecorator decorator with given target and key', () => {
            const target = class Target {};
            const key = 'some key';

            Prop(target, key);

            expect(decorator).toHaveBeenCalledWith(target, key);
        });
    });

    describe('target and key not provided', () => {
        
        it('should return decorator', () => {
            expect(Prop()).toBeInstanceOf(Function);
        });

        it('should returned decorator call BasePropDecorator with data from design:type metadata on call', () => {
            const target = class Target {};
            const key = 'some key';
            Reflect.defineMetadata('design:type', 'some type', target, key);

            Prop()(target, key);

            expect(BasePropDecoratorModule.BasePropDecorator).toHaveBeenCalledWith('some type');
        });

        it('should returned decorator call BasePropDecorator with empty object if design:type metadata is empty on call', () => {
            const target = class Target {};
            const key = 'some key';

            Prop()(target, key);

            expect(BasePropDecoratorModule.BasePropDecorator).toHaveBeenCalledWith({});
        });

        it('should returned decorator call returned by BasePropDecorator decorator with given target and key on call', () => {
            const target = class Target {};
            const key = 'some key';

            Prop()(target, key);

            expect(decorator).toHaveBeenCalledWith(target, key);
        });
    });
});
