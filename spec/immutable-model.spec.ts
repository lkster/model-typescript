import { ImmutableModel, Prop } from '..';

interface SomeObject {
    a: string;
    b: { c: number };
}

class TestModel extends ImmutableModel<TestModel> {
    @Prop public readonly id: number;
    @Prop public readonly name: string;
}

class TestObjectModel extends ImmutableModel<TestObjectModel> {
    @Prop public readonly complex: SomeObject;
}

class TestArrayModel extends ImmutableModel<TestArrayModel> {
    @Prop public readonly arr: string[][];
}

class TestWithModel extends ImmutableModel<TestWithModel> {
    @Prop public readonly test: TestModel;
}

class TestWithDeepModel extends ImmutableModel<TestWithDeepModel> {
    @Prop public readonly deep: TestWithModel;
}

describe('Immutable Model', () => {

    describe('Instantiation', () => {

        it('should properly set all provided values in constructor', () => {
            const model = new TestModel({
                id: 2,
                name: 'some name',
            });

            expect(model).toEqual(expect.objectContaining({
                id: 2,
                name: 'some name',
            }));
        });

        it('should set only values that are defined as props of the model', () => {
            const model = new TestModel({
                id: 2,
                name: 'some name',
                surname: 'this should not be here',
            } as any);

            expect(model).toEqual(expect.objectContaining({
                id: 2,
                name: 'some name',
            }));
        });

        it(`should clone plain objects values instead of assign it's reference`, () => {
            const obj: SomeObject = {
                a: 'something',
                b: {
                    c: 4,
                },
            };

            const model = new TestObjectModel({
                complex: obj,
            });

            expect(model.complex).not.toBe(obj);
            expect(model.complex.b).not.toBe(obj.b);
        });

        it(`should clone arrays values instead of assign it's reference`, () => {
            const arr: string[][] = [
                ['something'],
                ['something other']
            ];

            const model = new TestArrayModel({
                arr,
            });

            expect(model.arr).not.toBe(arr);
            expect(model.arr[0]).not.toBe(arr[0]);
            expect(model.arr[1]).not.toBe(arr[1]);
        });

        it('should create immutable models for provided plain data', () => {
            const model = new TestWithDeepModel({
                deep: {
                    test: {
                        id: 2,
                        name: 'some name'
                    }
                }
            });

            expect(model.deep).toBeInstanceOf(ImmutableModel);
            expect(model.deep.test).toBeInstanceOf(ImmutableModel);
        });

        it('should pass immutable models if provided data has them already created', () => {
            const model = new TestWithDeepModel({
                deep: new TestWithModel({
                    test: new TestModel({
                        id: 2,
                        name: 'some name',
                    }),
                }),
            });

            expect(model.deep).toBeInstanceOf(ImmutableModel);
            expect(model.deep.test).toBeInstanceOf(ImmutableModel);
        });
    });

    describe('Immutability', () => {
        it('should be frozen', () => {
            const model = new TestModel({
                id: 2,
                name: 'some name',
            });

            expect(Object.isFrozen(model)).toBe(true);
        });

        it('should not allow property to be changed', () => {
            const model = new TestModel({
                id: 2,
                name: 'some name',
            });

            expect(() => {
                (model as any).id = 3;
            }).toThrowError(TypeError);
            
            expect(model.id).toBe(2);
        });

        it('should freeze plain objects', () => {
            const model = new TestObjectModel({
                complex: {
                    a: 'something',
                    b: {
                        c: 4,
                    },
                },
            });

            expect(Object.isFrozen(model.complex)).toBe(true);
            expect(Object.isFrozen(model.complex.b)).toBe(true);
        });

        it('should freeze arrays', () => {
            const model = new TestArrayModel({
                arr: [
                    ['something'],
                    ['something other']
                ],
            });

            expect(Object.isFrozen(model.arr)).toBe(true);
            expect(Object.isFrozen(model.arr[0])).toBe(true);
            expect(Object.isFrozen(model.arr[1])).toBe(true);
        });
    });

    describe('Set() method', () => {
        const model = new TestModel({
            id: 2,
            name: 'some name',
        });

        it('should return new instance of itself with updated data', () => {
            const updatedModel = model.set({
                name: 'some new name',
            });

            expect(updatedModel.name).toBe('some new name');
            expect(updatedModel).not.toBe(model);
        });

        it('should not update own data', () => {
            model.set({
                name: 'some new name',
            });

            expect(model.name).toBe('some name');
        });

        it('should clone all object values', () => {
            
        });
    });

    describe('clone() method', () => {
        it('should clone itself', () => {
            const model = new TestModel({
                id: 2,
                name: 'some name',
            });

            const updatedModel = model.clone();

            expect(updatedModel).not.toBe(model);
            expect(updatedModel).toEqual(expect.objectContaining(model));
        });

        it('should clone all object values', () => {
            const model = new TestObjectModel({
                complex: {
                    a: 'something',
                    b: {
                        c: 4,
                    },
                },
            });

            const updatedModel = model.clone();

            expect(updatedModel.complex).not.toBe(model.complex);
            expect(updatedModel.complex.b).not.toBe(model.complex.b);
        });

        it('should clone all array values', () => {
            const model = new TestArrayModel({
                arr: [
                    ['something'],
                    ['something other']
                ],
            });

            const updatedModel = model.clone();

            expect(updatedModel.arr).not.toBe(model.arr);
            expect(updatedModel.arr[0]).not.toBe(model.arr[0]);
            expect(updatedModel.arr[1]).not.toBe(model.arr[1]);
        });
    });
});
