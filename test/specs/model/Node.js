'use strict';

/* global describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const Location = require('../../../lib/model/Location');
const Sources = require('../../../lib/model/Sources');
const Node = require('../../../lib/model/Node');

describe('model/Node', function () {
    describe('appendChild', function () {
        it('should be able to append a new child', function () {
            let p = new Node();
            let c = new Node;

            p.appendChild(c);

            expect(c.parent).to.be(p);
            expect(p.childNodes).to.be.same([ c ]);
        });
    });
});
