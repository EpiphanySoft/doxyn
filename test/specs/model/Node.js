'use strict';

/* global require, describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const Location = require('../../../lib/model/Location');
const Sources = require('../../../lib/model/Sources');
const Node = require('../../../lib/model/Node');

describe('model/Node', function () {
    describe('basics', function () {
        it('should be able to append a new child', function () {
            let p = new Node();
            let c = new Node;

            p.appendChild(c);

            expect(c.parent).to.be(p);
            expect(p.childNodes).to.be.same([ c ]);
            expect(p.firstChild).to.be(c);
            expect(p.lastChild).to.be(c);
            expect(c.childIndex).to.be(0);

            let d = new Node();

            p.appendChild(d);

            expect(d.parent).to.be(p);
            expect(p.childNodes).to.be.same([ c, d ]);

            expect(p.firstChild).to.be(c);
            expect(p.lastChild).to.be(d);

            expect(c.childIndex).to.be(0);
            expect(d.childIndex).to.be(1);
        });

        it('should be able to insert a new child', function () {
            let p = new Node();
            let c = new Node;

            p.insertBefore(c, null);

            expect(c.parent).to.be(p);
            expect(p.childNodes).to.be.same([ c ]);
            expect(p.firstChild).to.be(c);
            expect(p.lastChild).to.be(c);
            expect(c.childIndex).to.be(0);

            let d = new Node();

            p.insertBefore(d, c);

            expect(d.parent).to.be(p);
            expect(p.childNodes).to.be.same([ d, c ]);

            expect(p.firstChild).to.be(d);
            expect(p.lastChild).to.be(c);

            expect(c.childIndex).to.be(1);
            expect(d.childIndex).to.be(0);
        });
    });
});
