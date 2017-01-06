'use strict';

/* global require, describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const Location = require('../../../lib/model/Location');
const Sources = require('../../../lib/model/Sources');
const Entity = require('../../../lib/model/Entity');

require('../../util'); // for expect(e).to.have.attribute('foo', 42)

describe('model/Entity', function () {
    it('should generate a Data class for each derived Entity', function () {
        class E extends Entity {}

        let e = new E({ a: 42 });

        expect(E.Data).to.not.be(Entity.Data);
        expect(Object.getPrototypeOf(E.Data)).to.be(Entity.Data);

        expect(e.data).to.have.only.own.property('a', 42);

        expect(Assert.print(e.data)).to.be(`{ a: 42 }`);
        expect(JSON.stringify(e.data)).to.be(`{"a":42}`);
    });

    it('should support default attribute values', function () {
        class E extends Entity {}

        E.define({
            attributes: {
                foo: 42
            }
        });

        let e = new E();

        expect(E.Data).to.not.be(Entity.Data);
        expect(Object.getPrototypeOf(E.Data)).to.be(Entity.Data);

        expect(e.data).to.have.only.property('foo', 42);
        expect(e.data).to.have.only.own.keys(); // no keys of its own

        expect(e).to.have.attribute('foo', 42);
        expect(e).to.not.have.own.attribute('foo');

        // Because the default value
        expect(Assert.print(e.data)).to.be(`{}`);
        expect(JSON.stringify(e.data)).to.be(`{}`);
    });

    it('should add accessors to derived class', function () {
        class E extends Entity {}

        E.define({
            attributes: {
                foo: 42
            }
        });

        let e = new E();

        expect(E.Data).to.not.be(Entity.Data);
        expect(Object.getPrototypeOf(E.Data)).to.be(Entity.Data);

        expect(e).to.have.property('foo', 42);
        expect(e).to.have.attribute('foo', 42);

        // Because the default value
        expect(Assert.print(e.data)).to.be(`{}`);
        expect(JSON.stringify(e.data)).to.be(`{}`);

        // Set the instance value:
        e.foo = 427;

        expect(e.data).to.have.only.own.property('foo', 427);
        expect(e).to.have.own.attribute('foo', 427);

        expect(Assert.print(e.data)).to.be(`{ foo: 427 }`);
        expect(JSON.stringify(e.data)).to.be(`{"foo":427}`);

        // Set the instance value to the default:
        e.foo = 42;

        expect(e.data).to.have.only.own.property('foo', 42);
        expect(e).to.have.own.attribute('foo', 42);

        expect(Assert.print(e.data)).to.be(`{ foo: 42 }`);
        expect(JSON.stringify(e.data)).to.be(`{"foo":42}`);

        // Back to the default value
        e.foo = undefined;

        expect(e).to.have.property('foo', 42);
        expect(e).to.have.attribute('foo', 42);
        expect(e).to.not.have.own.attribute('foo');

        expect(Assert.print(e.data)).to.be(`{}`);
        expect(JSON.stringify(e.data)).to.be(`{}`);
    });

    it('should clone and include data', function () {
        class E extends Entity {}

        E.define({
            attributes: {
                foo: 42
            }
        });

        let e = new E({
            foo: 427
        });

        e = e.clone();

        expect(E.Data).to.not.be(Entity.Data);
        expect(Object.getPrototypeOf(E.Data)).to.be(Entity.Data);

        expect(e.data).to.have.own.only.property('foo', 427);

        expect(e).to.have.attribute('foo', 427);
        expect(e).to.have.own.attribute('foo', 427);

        // Because the default value
        expect(Assert.print(e.data)).to.be(`{ foo: 427 }`);
        expect(JSON.stringify(e.data)).to.be(`{"foo":427}`);
    });

    it('should clone with no data', function () {
        class E extends Entity {}

        E.define({
            attributes: {
                foo: 42
            }
        });

        let e = new E();
        e = e.clone();

        expect(E.Data).to.not.be(Entity.Data);
        expect(Object.getPrototypeOf(E.Data)).to.be(Entity.Data);

        expect(e.data).to.have.only.property('foo', 42);
        expect(e.data).to.have.only.own.keys(); // no keys of its own

        expect(e).to.have.attribute('foo', 42);
        expect(e).to.not.have.own.attribute('foo');

        // Because the default value
        expect(Assert.print(e.data)).to.be(`{}`);
        expect(JSON.stringify(e.data)).to.be(`{}`);
    });
});
