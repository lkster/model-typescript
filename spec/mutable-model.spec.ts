import { MutableModel, Prop, ImmutableModel } from '../src';


interface SomeObject {
    a: string;
    b: { c: number };
}

class TestModel extends MutableModel<TestModel> {
    @Prop public id: number;
    @Prop public name: string;
}

class TestArrayModel extends MutableModel<TestArrayModel> {
    @Prop public arr: string[][];
}

class TestWithModel extends MutableModel<TestWithModel> {
    @Prop public test: TestModel;
}

class TestWithDeepModel extends MutableModel<TestWithDeepModel> {
    @Prop public deep: TestWithModel;
}

class TestImmutableModel extends ImmutableModel<TestImmutableModel> {
    @Prop public readonly name: string;
}

class TestWithImmutableModel extends MutableModel<TestWithImmutableModel> {
    @Prop public immutable: TestImmutableModel;
}

class TestObjectModel extends MutableModel<TestObjectModel> {
    @Prop public complex: SomeObject;
    @Prop public mutable: TestModel;
    @Prop public immutable: TestImmutableModel;
}

class TestWithOptionalModel extends MutableModel<TestWithOptionalModel> {
    @Prop public test?: TestModel;
}

describe('Mutable Model', () => {
    
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

        it('should create mutable models for provided plain data', () => {
            const model = new TestWithDeepModel({
                deep: {
                    test: {
                        id: 2,
                        name: 'some name'
                    }
                }
            });

            expect(model.deep).toBeInstanceOf(MutableModel);
            expect(model.deep.test).toBeInstanceOf(MutableModel);
        });

        it('should pass mutable models if provided data has them already created', () => {
            const model = new TestWithDeepModel({
                deep: new TestWithModel({
                    test: new TestModel({
                        id: 2,
                        name: 'some name',
                    }),
                }),
            });

            expect(model.deep).toBeInstanceOf(MutableModel);
            expect(model.deep.test).toBeInstanceOf(MutableModel);
        });

        it('should create immutable model for provided plain data', () => {
            const model = new TestWithImmutableModel({
                immutable: {
                    name: 'some name',
                },
            });

            expect(model.immutable).toBeInstanceOf(ImmutableModel);
        });

        it('should pass immutable model if provided data has it already created', () => {
            const model = new TestWithImmutableModel({
                immutable: {
                    name: 'some name',
                },
            });

            expect(model.immutable).toBeInstanceOf(ImmutableModel);
        });

        it('should do nothing if value provided to optional property of model type is undefined', () => {
            const model: TestWithOptionalModel = new TestWithOptionalModel({
                test: undefined,
            });

            expect(model.test).toBeUndefined();
        });
    });

    describe('Set()', () => {
        
        it('should update data', () => {
            const model: TestModel = new TestModel({
                id: 2,
                name: 'some name',
            });

            model.set({
                name: 'some new name',
            });
            
            expect(model.name).toBe('some new name');
        });

        it('should update mutable models for provided plain data', () => {
            const model = new TestWithDeepModel({
                deep: {
                    test: {
                        id: 2,
                        name: 'some name'
                    }
                }
            });
            const deepModel: TestWithModel = model.deep;
            const testModel: TestModel = model.deep.test;

            model.set({
                deep: {
                    test: {
                        name: 'some new name',
                    },
                },
            });

            expect(model.deep.test.name).toBe('some new name');
            expect(model.deep).toBe(deepModel);
            expect(model.deep.test).toBe(testModel);
        });

        it('should assign new mutable models if they are provided', () => {
            const model = new TestWithDeepModel({
                deep: {
                    test: {
                        id: 2,
                        name: 'some name'
                    }
                }
            });
            const deepModel: TestWithModel = model.deep;
            const testModel: TestModel = model.deep.test;

            model.set({
                deep: new TestWithModel({
                    test: new TestModel({
                        id: 2,
                        name: 'some new name',
                    }),
                }),
            });

            expect(model.deep.test.name).toBe('some new name');
            expect(model.deep).not.toBe(deepModel);
            expect(model.deep.test).not.toBe(testModel);
        });

        it('should create immutable model for provided plain data', () => {
            const model = new TestWithImmutableModel({
                immutable: {
                    name: 'some name'
                },
            });

            expect(model.immutable).toBeInstanceOf(ImmutableModel);
        });

        it('should assign new immutable model if it is provided', () => {
            const model = new TestWithImmutableModel({
                immutable: new TestImmutableModel({
                    name: 'some name',
                }),
            });

            expect(model.immutable).toBeInstanceOf(ImmutableModel);
        });
    });

    describe('Clone() method', () => {
        
        it('should clone itself', () => {
            const model = new TestModel({
                id: 2,
                name: 'some name',
            });

            const clonedModel = model.clone();

            expect(clonedModel).not.toBe(model);
            expect(clonedModel).toEqual(expect.objectContaining(model));
        });

        it('should pass references to new model if deepClone parameter is set to false', () => {
            const model = new TestObjectModel({
                complex: {
                    a: 'something',
                    b: {
                        c: 4,
                    },
                },
                mutable: {
                    id: 2,
                    name: 'some mutable name',
                },
                immutable: {
                    name: 'some immutable name',
                }
            });

            const clonedModel = model.clone();

            expect(clonedModel.complex).toBe(model.complex);
            expect(clonedModel.complex.b).toBe(model.complex.b);
            expect(clonedModel.mutable).toBe(model.mutable);
            expect(clonedModel.immutable).toBe(model.immutable);
        });

        it('should deep clone values if deepClone parameter is set to true', () => {
            const model = new TestObjectModel({
                complex: {
                    a: 'something',
                    b: {
                        c: 4,
                    },
                },
                mutable: {
                    id: 2,
                    name: 'some mutable name',
                },
                immutable: {
                    name: 'some immutable name',
                }
            });

            const clonedModel = model.clone(true);

            expect(clonedModel.complex).not.toBe(model.complex);
            expect(clonedModel.complex.b).not.toBe(model.complex.b);
            expect(clonedModel.mutable).not.toBe(model.mutable);
            expect(clonedModel.immutable).not.toBe(model.immutable);
        });

        it('should deep clone models with nested models if deepClone parameter is set to true', () => {
            const model = new TestWithDeepModel({
                deep: {
                    test: {
                        id: 2,
                        name: 'some name'
                    }
                }
            });

            const clonedModel = model.clone(true);

            expect(clonedModel.deep).not.toBe(model.deep);
            expect(clonedModel.deep.test).not.toBe(model.deep.test);
        });
    });

    describe('Freeze() method', () => {
        
        it('should clone all objects', () => {
            const complexObject = {
                a: 'something',
                b: {
                    c: 4,
                },
            };

            const mutableModel = new TestModel({
                id: 2,
                name: 'some mutable name',
            });

            const immutableModel = new TestImmutableModel({
                name: 'some immutable name',
            });

            const model = new TestObjectModel({
                complex: complexObject,
                mutable: mutableModel,
                immutable: immutableModel
            });

            model.freeze();

            expect(model.complex).not.toBe(complexObject);
            expect(model.mutable).not.toBe(mutableModel);
            expect(model.immutable).not.toBe(immutableModel);
        });

        it('should freeze itself and all depended objects', () => {
            const model = new TestObjectModel({
                complex: {
                    a: 'something',
                    b: {
                        c: 4,
                    },
                },
                mutable: {
                    id: 2,
                    name: 'some mutable name',
                },
                immutable: {
                    name: 'some immutable name',
                }
            });

            model.freeze();

            expect(Object.isFrozen(model)).toBe(true);
            expect(Object.isFrozen(model.complex)).toBe(true);
            expect(Object.isFrozen(model.mutable)).toBe(true);
            expect(Object.isFrozen(model.immutable)).toBe(true);
        });
    });
});
