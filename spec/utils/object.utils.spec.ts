import { ObjectUtils } from '@/utils/object.utils';

describe('Object Utils', () => {
    
    describe('isPlainObject() method', () => {
        
        it('should return true if object is plain object', () => {
            expect(ObjectUtils.isPlainObject({})).toBe(true);
            expect(ObjectUtils.isPlainObject(new Object())).toBe(true);
        });

        it('should return false if object is not plain object', () => {
            expect(ObjectUtils.isPlainObject(() => {})).toBe(false);
            expect(ObjectUtils.isPlainObject(new Function())).toBe(false);
            expect(ObjectUtils.isPlainObject([])).toBe(false);
            expect(ObjectUtils.isPlainObject(new Array())).toBe(false);
            expect(ObjectUtils.isPlainObject(Date)).toBe(false);
            expect(ObjectUtils.isPlainObject(new Date())).toBe(false);
            expect(ObjectUtils.isPlainObject(true)).toBe(false);
            expect(ObjectUtils.isPlainObject('')).toBe(false);
            expect(ObjectUtils.isPlainObject(21)).toBe(false);
            expect(ObjectUtils.isPlainObject(null)).toBe(false);
            expect(ObjectUtils.isPlainObject(undefined)).toBe(false);
            expect(ObjectUtils.isPlainObject(class {})).toBe(false);
            expect(ObjectUtils.isPlainObject(new class {})).toBe(false);
        });
    });

    describe('deepFreeze() method', () => {
        it('should freeze object', () => {
            const obj = {};

            ObjectUtils.deepFreeze(obj);

            expect(Object.isFrozen(obj)).toBe(true);
        });

        it('should freeze all nested objects', () => {
            const obj = { a: { b: { c: { d: { e: {} } } } } };

            ObjectUtils.deepFreeze(obj);

            expect(Object.isFrozen(obj.a)).toBe(true);
            expect(Object.isFrozen(obj.a.b)).toBe(true);
            expect(Object.isFrozen(obj.a.b.c)).toBe(true);
            expect(Object.isFrozen(obj.a.b.c.d)).toBe(true);
            expect(Object.isFrozen(obj.a.b.c.d.e)).toBe(true);
        });

        it('should freeze array', () => {
            const arr = [];

            ObjectUtils.deepFreeze(arr);

            expect(Object.isFrozen(arr)).toBe(true);
        });

        it('should freeze all nested arrays', () => {
            const arr = [[[[[]]]]];

            ObjectUtils.deepFreeze(arr);

            expect(Object.isFrozen(arr[0])).toBe(true);
            expect(Object.isFrozen(arr[0][0])).toBe(true);
            expect(Object.isFrozen(arr[0][0][0])).toBe(true);
            expect(Object.isFrozen(arr[0][0][0][0])).toBe(true);
            expect(Object.isFrozen(arr[0][0][0][0][0])).toBe(true);
        });

        it('should freeze all nested objects and arrays', () => {
            const obj = {
                a: {
                    arr: []
                },
                arr: [
                    {}
                ]
            };

            ObjectUtils.deepFreeze(obj);

            expect(Object.isFrozen(obj.a)).toBe(true);
            expect(Object.isFrozen(obj.a.arr)).toBe(true);
            expect(Object.isFrozen(obj.arr)).toBe(true);
            expect(Object.isFrozen(obj.arr[0])).toBe(true);
        });

        it('should not freeze not plain objects or arrays', () => {
            const obj = {
                a: function () {},
                b: class {},
                c: new class {},
                d: Date,
                e: new Date(),
            }

            ObjectUtils.deepFreeze(obj);

            expect(Object.isFrozen(obj.a)).toBe(false);
            expect(Object.isFrozen(obj.b)).toBe(false);
            expect(Object.isFrozen(obj.c)).toBe(false);
            expect(Object.isFrozen(obj.d)).toBe(false);
            expect(Object.isFrozen(obj.e)).toBe(false);
        });
    });
});