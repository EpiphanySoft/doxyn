'use strict';

/* global require, describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const Enum = require('../../lib/Enum');

describe('Enum', function () {
    class B extends Enum {}
    B.define({
        values: {
            B1: 'E10: This is B1',
            B2: 'W: This is B2',
            B3: 'I1: This is B3',
            B4: 'D: This is B4',
            B5: 'T1000: This is B5',
            B6: 'This is B6'
        }
    });

    class C extends B {}
    C.defineValues({
        C1: {
            foo: 42,
            defaultLevel: 'W',
            text: 'E1001: This is C1'
        },
        C2: {
            bar: -42,
            text: 'E: This is C2'
        },
        C3: {
            zip: 427,
            text: 'This is C3'
        }
    });

    describe('Basic enum', function () {
        it('should have the correct properties from a full string for Error', function () {
            expect(B.B1.name).to.be('B1');
            expect(B.B1.level).to.be('E');
            expect(B.B1.defaultLevel).to.be('E');
            expect(B.B1.code).to.be(10);
            expect(B.B1.text).to.be('This is B1');
        });

        it('should have the correct properties from a string w/o code for Warn', function () {
            expect(B.B2.name).to.be('B2');
            expect(B.B2.level).to.be('W');
            expect(B.B2.defaultLevel).to.be('W');
            expect(B.B2.code).to.be(0);
            expect(B.B2.text).to.be('This is B2');
        });

        it('should have the correct properties from a full string for Info', function () {
            expect(B.B3.name).to.be('B3');
            expect(B.B3.level).to.be('I');
            expect(B.B3.defaultLevel).to.be('I');
            expect(B.B3.code).to.be(1);
            expect(B.B3.text).to.be('This is B3');
        });

        it('should have the correct properties from a string w/o code for Debug', function () {
            expect(B.B4.name).to.be('B4');
            expect(B.B4.level).to.be('D');
            expect(B.B4.defaultLevel).to.be('D');
            expect(B.B4.code).to.be(0);
            expect(B.B4.text).to.be('This is B4');
        });

        it('should have the correct properties from a full string for Trace', function () {
            expect(B.B5.name).to.be('B5');
            expect(B.B5.level).to.be('T');
            expect(B.B5.defaultLevel).to.be('T');
            expect(B.B5.code).to.be(1000);
            expect(B.B5.text).to.be('This is B5');
        });

        it('should have the correct properties from a string w/o code or level', function () {
            expect(B.B6.name).to.be('B6');
            expect(B.B6.level).to.be('D');
            expect(B.B6.defaultLevel).to.be('D');
            expect(B.B6.code).to.be(0);
            expect(B.B6.text).to.be('This is B6');
        });

        it('should have the correct values', function () {
            expect(B.values).to.be.same([ B.B1, B.B2, B.B3, B.B4, B.B5, B.B6 ]);
        });

        it('should have the correct codes', function () {
            expect(B.codes).to.have.only.keys('1', '10', '1000');

            expect(B.codes).to.be.flatly.same({
                10: B.B1,
                1: B.B3,
                1000: B.B5
            });
        });

        it('should be able to for-of loop the values', function () {
            let a = [];

            for (let c of B) {
                a.push(c);
            }

            expect(a).to.be.same(B.values);
        });
    });

    describe('Derived enum', function () {
        it('should have the correct values', function () {
            expect(C.values).to.be.same([
                B.B1, B.B2, B.B3, B.B4, B.B5, B.B6,
                C.C1, C.C2, C.C3
            ]);
        });

        it('should have the correct codes', function () {
            expect(C.codes).to.not.have.own.key('1');
            expect(C.codes).to.not.have.own.key('10');
            expect(C.codes).to.not.have.own.key('1000');

            expect(C.codes).to.have.own.key('1001');

            expect(C.codes).to.have.only.own.keys('1001');

            expect(C.codes).to.be.flatly.same({
                10: B.B1,
                1: B.B3,
                1000: B.B5,

                1001: C.C1
            });
        });

        it('should be able to for-of loop the values', function () {
            let a = [];

            for (let c of C) {
                a.push(c);
            }

            expect(a).to.be.same(C.values);
        });

        it('should have the correct properties from a full string text property', function () {
            expect(C.C1.name).to.be('C1');
            expect(C.C1.level).to.be('E');
            expect(C.C1.defaultLevel).to.be('W'); // overridden on this one
            expect(C.C1.code).to.be(1001);
            expect(C.C1.text).to.be('This is C1');

            expect(C.C1.foo).to.be(42);
        });

        it('should have the correct properties from a string w/o code in text prop', function () {
            expect(C.C2.name).to.be('C2');
            expect(C.C2.level).to.be('E');
            expect(C.C2.defaultLevel).to.be('E');
            expect(C.C2.code).to.be(0);
            expect(C.C2.text).to.be('This is C2');

            expect(C.C2.bar).to.be(-42);
        });

        it('should have the correct properties from just text in text prop', function () {
            expect(C.C3.name).to.be('C3');
            expect(C.C3.level).to.be('D');
            expect(C.C3.defaultLevel).to.be('D');
            expect(C.C3.code).to.be(0);
            expect(C.C3.text).to.be('This is C3');

            expect(C.C3.zip).to.be(427);
        });
    });

    describe('Negative checks', function () {
        it('should prevent enum creation', function () {
            expect(() => {
                new C();
            }).
            to.exactly.throw(`Cannot create enum class instances`);
        });

        it('should prevent enum name duplication', function () {
            class D extends Enum {}

            D.define({
                values: {
                    A: 'A'
                }
            });

            // Derived enum classes can replace named constants:
            expect(() => {
                class E extends D {}

                E.define({
                    values: {
                        A: 'A'
                    }
                });

                expect(E.A).to.not.be(D.A);
            }).
            to.not.throw();

            expect(() => {
                class E extends Enum {}

                // But within one enum class, names must be case-insensitively unique:
                E.define({
                    values: {
                        A: 'A',
                        a: 'a'
                    }
                });
            }).
            to.exactly.throw(`Duplicate enum constant name "a"`);
        });

        it('should prevent enum code duplication', function () {
            class D extends Enum {}

            D.define({
                values: {
                    A: 'E42: A'
                }
            });

            expect(D.codes[42]).to.be(D.A);

            // Derived enum classes can replace named constants:
            expect(() => {
                class E extends D {}

                E.define({
                    values: {
                        B: 'E42: B'
                    }
                });

                expect(E.B).to.not.be(D.A);
                expect(E.codes[42]).to.be(E.B);
            }).
            to.not.throw();

            expect(() => {
                class E extends Enum {}

                // But within one enum class, names must be case-insensitively unique:
                E.define({
                    values: {
                        B: 'E123: Foo',
                        C: 'D123: Bar'
                    }
                });
            }).
            to.exactly.throw(`Duplicate enum code 123 for "C"`);
        });
    });
});
