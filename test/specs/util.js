'use strict';

/* global require, describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const Util = require('../../lib/util');

describe('util', function () {
    describe('Empty', function () {
        it('should have only hasOwnProperty', function () {
            let e = new Util.Empty();

            expect(e.hasOwnProperty).to.be.a('function');

            expect(e.isPrototypeOf).to.be.an('undefined');
            expect(e.propertyIsEnumerable).to.be.an('undefined');
            expect(e.toLocaleString).to.be.an('undefined');
            expect(e.toSource).to.be.an('undefined');
            expect(e.toString).to.be.an('undefined');
            expect(e.unwatch).to.be.an('undefined');
            expect(e.valueOf).to.be.an('undefined');
            expect(e.watch).to.be.an('undefined');
        });
    });
});
