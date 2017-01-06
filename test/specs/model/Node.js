'use strict';

/* global require, describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const Location = require('../../../lib/model/Location');
const Sources = require('../../../lib/model/Sources');
const Node = require('../../../lib/model/Node');

describe.only('model/Node', function () {
    describe('basics', function () {
        it('should be able to append a new child', function () {
            let p = new Node();
            let c = new Node();
            let d = new Node();

            expect(p.contains(c)).to.be(0);
            expect(p.contains(d)).to.be(0);

            p.appendChild(c);

            expect(c.parent).to.be(p);
            expect(p.childNodes).to.be.same([ c ]);
            expect(p.firstChild).to.be(c);
            expect(p.lastChild).to.be(c);
            expect(c.childIndex).to.be(0);

            expect(p.contains(c)).to.be(1);
            expect(p.contains(d)).to.be(0);

            p.appendChild(d);

            expect(d.parent).to.be(p);
            expect(p.childNodes).to.be.same([ c, d ]);

            expect(p.firstChild).to.be(c);
            expect(p.lastChild).to.be(d);

            expect(c.childIndex).to.be(0);
            expect(d.childIndex).to.be(1);

            expect(p.contains(c)).to.be(1);
            expect(p.contains(d)).to.be(1);

            expect(c.nextSibling).to.be(d);
            expect(d.nextSibling).to.be(null);

            expect(c.previousSibling).to.be(null);
            expect(d.previousSibling).to.be(c);
        });

        it('should be able to insert a new child', function () {
            let p = new Node();
            let c = new Node();
            let d = new Node();

            expect(p.contains(c)).to.be(0);
            expect(p.contains(d)).to.be(0);

            p.insertBefore(c, null);

            expect(c.parent).to.be(p);
            expect(p.childNodes).to.be.same([ c ]);
            expect(p.firstChild).to.be(c);
            expect(p.lastChild).to.be(c);
            expect(c.childIndex).to.be(0);

            expect(p.contains(c)).to.be(1);
            expect(p.contains(d)).to.be(0);

            p.insertBefore(d, c);

            expect(d.parent).to.be(p);
            expect(p.childNodes).to.be.same([ d, c ]);

            expect(p.firstChild).to.be(d);
            expect(p.lastChild).to.be(c);

            expect(c.childIndex).to.be(1);
            expect(d.childIndex).to.be(0);

            expect(p.contains(c)).to.be(1);
            expect(p.contains(d)).to.be(1);

            expect(c.nextSibling).to.be(null);
            expect(d.nextSibling).to.be(c);

            expect(c.previousSibling).to.be(d);
            expect(d.previousSibling).to.be(null);
        });
    }); // basics

    describe('name index', function () {
        it('should build name index', function () {
            let p = new Node();
            let c = new Node({ name: 'c' });
            let d = new Node({ name: 'd' });

            p.appendChild(c);

            let f = p.getFirstChildByName('c');
            expect(f).to.be(c);
            expect(f.nextSiblingSameName).to.be(null);
            expect(f.previousSiblingSameName).to.be(null);

            p.appendChild(d);

            f = p.getFirstChildByName('c');
            expect(f).to.be(c);
            expect(f.nextSiblingSameName).to.be(null);
            expect(f.previousSiblingSameName).to.be(null);

            f = p.getFirstChildByName('d');
            expect(f).to.be(d);
            expect(f.nextSiblingSameName).to.be(null);
            expect(f.previousSiblingSameName).to.be(null);
        });

        it('should build name index with duplicates', function () {
            let p = new Node();
            let c = new Node({ name: 'c' });
            let d = new Node({ name: 'd' });
            let c2 = new Node({ name: 'c' });
            let d2 = new Node({ name: 'd' });
            let c3 = new Node({ name: 'c' });
            let d3 = new Node({ name: 'd' });
            let f;

            p.appendChild(c);
            p.appendChild(d);

            f = p.getFirstChildByName('c');
            expect(f).to.be(c);
            expect(f.nextSiblingSameName).to.be(null);
            expect(f.previousSiblingSameName).to.be(null);

            f = p.getFirstChildByName('d');
            expect(f).to.be(d);
            expect(f.nextSiblingSameName).to.be(null);
            expect(f.previousSiblingSameName).to.be(null);

            p.appendChild(c2);
            p.appendChild(d2);

            f = p.getFirstChildByName('c');
            expect(f).to.be(c);
            expect(f.nextSiblingSameName).to.be(c2);
            expect(f.previousSiblingSameName).to.be(null);

            f = p.getFirstChildByName('d');
            expect(f).to.be(d);
            expect(f.nextSiblingSameName).to.be(d2);
            expect(f.previousSiblingSameName).to.be(null);

            f = p.getLastChildByName('c');
            expect(f).to.be(c2);
            expect(f.nextSiblingSameName).to.be(null);
            expect(f.previousSiblingSameName).to.be(c);

            f = p.getLastChildByName('d');
            expect(f).to.be(d2);
            expect(f.nextSiblingSameName).to.be(null);
            expect(f.previousSiblingSameName).to.be(d);

            p.appendChild(c3);
            p.appendChild(d3);

            expect(c.nextSiblingSameName).to.be(c2);
            expect(c.previousSiblingSameName).to.be(null);

            expect(d.nextSiblingSameName).to.be(d2);
            expect(d.previousSiblingSameName).to.be(null);

            expect(c2.nextSiblingSameName).to.be(c3);
            expect(c2.previousSiblingSameName).to.be(c);

            expect(d2.nextSiblingSameName).to.be(d3);
            expect(d2.previousSiblingSameName).to.be(d);

            expect(c3.nextSiblingSameName).to.be(null);
            expect(c3.previousSiblingSameName).to.be(c2);

            expect(d3.nextSiblingSameName).to.be(null);
            expect(d3.previousSiblingSameName).to.be(d2);

            f = p.getFirstChildByName('c');
            expect(f).to.be(c);

            f = p.getFirstChildByName('d');
            expect(f).to.be(d);

            f = p.getLastChildByName('c');
            expect(f).to.be(c3);

            f = p.getLastChildByName('d');
            expect(f).to.be(d3);

            for (let cc of p.getChildrenByName('c')) {
                //
            }
        });

        it('should update name index on change', function () {
            let p = new Node();
            let c = new Node({ name: 'c' });
            let d = new Node({ name: 'd' });
            let c2 = new Node({ name: 'c' });
            let d2 = new Node({ name: 'd' });
            let c3 = new Node({ name: 'c' });
            let d3 = new Node({ name: 'd' });
            let f;

            p.appendChild(c);
            p.appendChild(d);
            p.appendChild(c2);
            p.appendChild(d2);
            p.appendChild(c3);
            p.appendChild(d3);

            expect(c.nextSiblingSameName).to.be(c2);
            expect(c.previousSiblingSameName).to.be(null);

            expect(d.nextSiblingSameName).to.be(d2);
            expect(d.previousSiblingSameName).to.be(null);

            expect(c2.nextSiblingSameName).to.be(c3);
            expect(c2.previousSiblingSameName).to.be(c);

            expect(d2.nextSiblingSameName).to.be(d3);
            expect(d2.previousSiblingSameName).to.be(d);

            expect(c3.nextSiblingSameName).to.be(null);
            expect(c3.previousSiblingSameName).to.be(c2);

            expect(d3.nextSiblingSameName).to.be(null);
            expect(d3.previousSiblingSameName).to.be(d2);

            f = p.getFirstChildByName('c');
            expect(f).to.be(c);

            f = p.getFirstChildByName('d');
            expect(f).to.be(d);

            f = p.getLastChildByName('c');
            expect(f).to.be(c3);

            f = p.getLastChildByName('d');
            expect(f).to.be(d3);

            c.name = 'd';

            expect(c.nextSiblingSameName).to.be(d);
            expect(c.previousSiblingSameName).to.be(null);

            expect(d.nextSiblingSameName).to.be(d2);
            expect(d.previousSiblingSameName).to.be(c);

            expect(c2.nextSiblingSameName).to.be(c3);
            expect(c2.previousSiblingSameName).to.be(null);

            expect(d2.nextSiblingSameName).to.be(d3);
            expect(d2.previousSiblingSameName).to.be(d);

            expect(c3.nextSiblingSameName).to.be(null);
            expect(c3.previousSiblingSameName).to.be(c2);

            expect(d3.nextSiblingSameName).to.be(null);
            expect(d3.previousSiblingSameName).to.be(d2);

            f = p.getFirstChildByName('c');
            expect(f).to.be(c2);

            f = p.getFirstChildByName('d');
            expect(f).to.be(c);

            f = p.getLastChildByName('c');
            expect(f).to.be(c3);

            f = p.getLastChildByName('d');
            expect(f).to.be(d3);
        });

        it('should update name index on removal', function () {
            let p = new Node();
            let c = new Node({ name: 'c' });
            let d = new Node({ name: 'd' });
            let c2 = new Node({ name: 'c' });
            let d2 = new Node({ name: 'd' });
            let c3 = new Node({ name: 'c' });
            let d3 = new Node({ name: 'd' });
            let f;

            p.appendChild(c);
            p.appendChild(d);
            p.appendChild(c2);
            p.appendChild(d2);
            p.appendChild(c3);
            p.appendChild(d3);

            expect(c.nextSiblingSameName).to.be(c2);
            expect(c.previousSiblingSameName).to.be(null);

            expect(d.nextSiblingSameName).to.be(d2);
            expect(d.previousSiblingSameName).to.be(null);

            expect(c2.nextSiblingSameName).to.be(c3);
            expect(c2.previousSiblingSameName).to.be(c);

            expect(d2.nextSiblingSameName).to.be(d3);
            expect(d2.previousSiblingSameName).to.be(d);

            expect(c3.nextSiblingSameName).to.be(null);
            expect(c3.previousSiblingSameName).to.be(c2);

            expect(d3.nextSiblingSameName).to.be(null);
            expect(d3.previousSiblingSameName).to.be(d2);

            f = p.getFirstChildByName('c');
            expect(f).to.be(c);

            f = p.getFirstChildByName('d');
            expect(f).to.be(d);

            f = p.getLastChildByName('c');
            expect(f).to.be(c3);

            f = p.getLastChildByName('d');
            expect(f).to.be(d3);

            c.remove();

            expect(c.nextSiblingSameName).to.be(null);
            expect(c.previousSiblingSameName).to.be(null);

            expect(d.nextSiblingSameName).to.be(d2);
            expect(d.previousSiblingSameName).to.be(null);

            expect(c2.nextSiblingSameName).to.be(c3);
            expect(c2.previousSiblingSameName).to.be(null);

            expect(d2.nextSiblingSameName).to.be(d3);
            expect(d2.previousSiblingSameName).to.be(d);

            expect(c3.nextSiblingSameName).to.be(null);
            expect(c3.previousSiblingSameName).to.be(c2);

            expect(d3.nextSiblingSameName).to.be(null);
            expect(d3.previousSiblingSameName).to.be(d2);

            f = p.getFirstChildByName('c');
            expect(f).to.be(c2);

            f = p.getFirstChildByName('d');
            expect(f).to.be(d);

            f = p.getLastChildByName('c');
            expect(f).to.be(c3);

            f = p.getLastChildByName('d');
            expect(f).to.be(d3);
        });
    });
});
