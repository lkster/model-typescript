import * as BasePropDecoratorModule from '../../src/decorators/base-prop.decorator';
import { ModelRef } from '../../src/decorators/model-ref.decorator';
import { ImmutableModel } from '../../src';


describe('ModelRef decorator', () => {
    
    class TestModel extends ImmutableModel<TestModel> {}

    beforeEach(() => {
        (BasePropDecoratorModule as any).BasePropDecorator = jest.fn() as any;
    });
    
    it('should call BasePropDecorator with given model in parameter', () => {
        ModelRef(TestModel);

        expect(BasePropDecoratorModule.BasePropDecorator).toHaveBeenCalledWith(TestModel);
    });
});
