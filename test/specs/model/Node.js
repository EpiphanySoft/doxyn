'use strict';

/* global require, describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const Location = require('../../../lib/model/Location');
const Node = require('../../../lib/model/Node');
const Document = require('../../../lib/model/Document');

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

            let o = [];

            for (let cc of p) {
                o.push(cc);
            }

            expect(o).to.be.same([ c, d ]);

            // Make sure we can iterate over empty list:
            o = [];
            for (let cc of p.getChildrenByName('x')) {
                o.push(cc);
            }
            expect(o).to.be.same([]);
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

            let o = [];

            for (let cc of p) {
                o.push(cc);
            }

            expect(o).to.be.same([ d, c ]);
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

            let o = [];

            for (let cc of p.getChildrenByName('c')) {
                o.push(cc);
            }

            expect(o).to.be.same([ c ]);

            o = [];

            for (let dd of p.getChildrenByName('d')) {
                o.push(dd);
            }

            expect(o).to.be.same([ d ]);
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

            let o = [];

            for (let cc of p.getChildrenByName('c')) {
                o.push(cc);
            }

            expect(o).to.be.same([ c, c2, c3 ]);

            o = [];

            for (let dd of p.getChildrenByName('d')) {
                o.push(dd);
            }

            expect(o).to.be.same([ d, d2, d3 ]);
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

            let o = [];

            for (let cc of p.getChildrenByName('c')) {
                o.push(cc);
            }

            expect(o).to.be.same([ c2, c3 ]);

            o = [];

            for (let dd of p.getChildrenByName('d')) {
                o.push(dd);
            }

            expect(o).to.be.same([ c, d, d2, d3 ]);
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

            let o = [];

            for (let cc of p.getChildrenByName('c')) {
                o.push(cc);
            }

            expect(o).to.be.same([ c2, c3 ]);

            o = [];

            for (let dd of p.getChildrenByName('d')) {
                o.push(dd);
            }

            expect(o).to.be.same([ d, d2, d3 ]);
        });
    }); // name index

    describe('tagName index', function () {
        class C extends Node {}
        class D extends Node {}
        
        C.define({
            tagName: 'c'
        });
        D.define({
            tagName: 'd'
        });
        
        it('should build tagName index', function () {
            let p = new Node();
            let c = new C();
            let d = new D();

            p.appendChild(c);

            let f = p.getFirstChildByTagName('c');
            expect(f).to.be(c);
            expect(f.nextSiblingSameTagName).to.be(null);
            expect(f.previousSiblingSameTagName).to.be(null);

            p.appendChild(d);

            f = p.getFirstChildByTagName('c');
            expect(f).to.be(c);
            expect(f.nextSiblingSameTagName).to.be(null);
            expect(f.previousSiblingSameTagName).to.be(null);

            f = p.getFirstChildByTagName('d');
            expect(f).to.be(d);
            expect(f.nextSiblingSameTagName).to.be(null);
            expect(f.previousSiblingSameTagName).to.be(null);

            let o = [];

            for (let cc of p.getChildrenByTagName('c')) {
                o.push(cc);
            }

            expect(o).to.be.same([ c ]);

            o = [];

            for (let dd of p.getChildrenByTagName('d')) {
                o.push(dd);
            }

            expect(o).to.be.same([ d ]);
        });

        it('should build tagName index with duplicates', function () {
            let p = new Node();
            let c = new C();
            let d = new D();
            let c2 = new C();
            let d2 = new D();
            let c3 = new C();
            let d3 = new D();
            let f;

            p.appendChild(c);
            p.appendChild(d);

            f = p.getFirstChildByTagName('c');
            expect(f).to.be(c);
            expect(f.nextSiblingSameTagName).to.be(null);
            expect(f.previousSiblingSameTagName).to.be(null);

            f = p.getFirstChildByTagName('d');
            expect(f).to.be(d);
            expect(f.nextSiblingSameTagName).to.be(null);
            expect(f.previousSiblingSameTagName).to.be(null);

            p.appendChild(c2);
            p.appendChild(d2);

            f = p.getFirstChildByTagName('c');
            expect(f).to.be(c);
            expect(f.nextSiblingSameTagName).to.be(c2);
            expect(f.previousSiblingSameTagName).to.be(null);

            f = p.getFirstChildByTagName('d');
            expect(f).to.be(d);
            expect(f.nextSiblingSameTagName).to.be(d2);
            expect(f.previousSiblingSameTagName).to.be(null);

            f = p.getLastChildByTagName('c');
            expect(f).to.be(c2);
            expect(f.nextSiblingSameTagName).to.be(null);
            expect(f.previousSiblingSameTagName).to.be(c);

            f = p.getLastChildByTagName('d');
            expect(f).to.be(d2);
            expect(f.nextSiblingSameTagName).to.be(null);
            expect(f.previousSiblingSameTagName).to.be(d);

            p.appendChild(c3);
            p.appendChild(d3);

            expect(c.nextSiblingSameTagName).to.be(c2);
            expect(c.previousSiblingSameTagName).to.be(null);

            expect(d.nextSiblingSameTagName).to.be(d2);
            expect(d.previousSiblingSameTagName).to.be(null);

            expect(c2.nextSiblingSameTagName).to.be(c3);
            expect(c2.previousSiblingSameTagName).to.be(c);

            expect(d2.nextSiblingSameTagName).to.be(d3);
            expect(d2.previousSiblingSameTagName).to.be(d);

            expect(c3.nextSiblingSameTagName).to.be(null);
            expect(c3.previousSiblingSameTagName).to.be(c2);

            expect(d3.nextSiblingSameTagName).to.be(null);
            expect(d3.previousSiblingSameTagName).to.be(d2);

            f = p.getFirstChildByTagName('c');
            expect(f).to.be(c);

            f = p.getFirstChildByTagName('d');
            expect(f).to.be(d);

            f = p.getLastChildByTagName('c');
            expect(f).to.be(c3);

            f = p.getLastChildByTagName('d');
            expect(f).to.be(d3);

            let o = [];

            for (let cc of p.getChildrenByTagName('c')) {
                o.push(cc);
            }

            expect(o).to.be.same([ c, c2, c3 ]);

            o = [];

            for (let dd of p.getChildrenByTagName('d')) {
                o.push(dd);
            }

            expect(o).to.be.same([ d, d2, d3 ]);
        });

        it('should update tagName index on removal', function () {
            let p = new Node();
            let c = new C();
            let d = new D();
            let c2 = new C();
            let d2 = new D();
            let c3 = new C();
            let d3 = new D();
            let f;

            p.appendChild(c);
            p.appendChild(d);
            p.appendChild(c2);
            p.appendChild(d2);
            p.appendChild(c3);
            p.appendChild(d3);

            expect(c.nextSiblingSameTagName).to.be(c2);
            expect(c.previousSiblingSameTagName).to.be(null);

            expect(d.nextSiblingSameTagName).to.be(d2);
            expect(d.previousSiblingSameTagName).to.be(null);

            expect(c2.nextSiblingSameTagName).to.be(c3);
            expect(c2.previousSiblingSameTagName).to.be(c);

            expect(d2.nextSiblingSameTagName).to.be(d3);
            expect(d2.previousSiblingSameTagName).to.be(d);

            expect(c3.nextSiblingSameTagName).to.be(null);
            expect(c3.previousSiblingSameTagName).to.be(c2);

            expect(d3.nextSiblingSameTagName).to.be(null);
            expect(d3.previousSiblingSameTagName).to.be(d2);

            f = p.getFirstChildByTagName('c');
            expect(f).to.be(c);

            f = p.getFirstChildByTagName('d');
            expect(f).to.be(d);

            f = p.getLastChildByTagName('c');
            expect(f).to.be(c3);

            f = p.getLastChildByTagName('d');
            expect(f).to.be(d3);

            c.remove();

            expect(c.nextSiblingSameTagName).to.be(null);
            expect(c.previousSiblingSameTagName).to.be(null);

            expect(d.nextSiblingSameTagName).to.be(d2);
            expect(d.previousSiblingSameTagName).to.be(null);

            expect(c2.nextSiblingSameTagName).to.be(c3);
            expect(c2.previousSiblingSameTagName).to.be(null);

            expect(d2.nextSiblingSameTagName).to.be(d3);
            expect(d2.previousSiblingSameTagName).to.be(d);

            expect(c3.nextSiblingSameTagName).to.be(null);
            expect(c3.previousSiblingSameTagName).to.be(c2);

            expect(d3.nextSiblingSameTagName).to.be(null);
            expect(d3.previousSiblingSameTagName).to.be(d2);

            f = p.getFirstChildByTagName('c');
            expect(f).to.be(c2);

            f = p.getFirstChildByTagName('d');
            expect(f).to.be(d);

            f = p.getLastChildByTagName('c');
            expect(f).to.be(c3);

            f = p.getLastChildByTagName('d');
            expect(f).to.be(d3);

            let o = [];

            for (let cc of p.getChildrenByTagName('c')) {
                o.push(cc);
            }

            expect(o).to.be.same([ c2, c3 ]);

            o = [];

            for (let dd of p.getChildrenByTagName('d')) {
                o.push(dd);
            }

            expect(o).to.be.same([ d, d2, d3 ]);
        });
    }); // tagName index

    describe('composite attributes', function () {
        class N extends Node {}

        N.defineAttribute('alias[|]', null);

        let doc, node;

        beforeEach(function () {
            doc = Document.create();
            node = new N();
            doc.appendChild(node);
        });
        afterEach(function () {
            doc = node = null;
        });

        it('should register properly', function () {
            let a = N.getAttribute('alias');

            expect(a.multiline).to.be(false);
            expect(a.composite).to.be(true);
        });

        it('should store even single values as arrays', function () {
            node.setAttribute('alias', 'foo');

            let a = node.getAttribute('alias');

            expect(a).to.equal([ 'foo' ]);
        });

        it('should split multiple values into an array', function () {
            node.setAttribute('alias', 'foo|bar');

            let a = node.getAttribute('alias');

            expect(a).to.equal([ 'foo', 'bar' ]);
        });

        it('should accept multiple values as an array', function () {
            node.setAttribute('alias', ['foo','bar']);

            let a = node.getAttribute('alias');

            expect(a).to.equal([ 'foo', 'bar' ]);
        });

        it('should store a single value with a location', function () {
            node.setAttribute('alias', 'foo', new Location('Foo.js', 123, 42));

            let a = node.getAttribute('alias');

            expect(a).to.equal([ 'foo' ]);

            let loc = node.getAttributeLocation('alias');
            expect(loc).to.be.an('array');

            expect(loc).to.have.length(1);
            expect(loc[0].toString()).to.be('Foo.js:123:42');

            let src = node.getAttributeSrc('alias');
            expect(src).to.be('0,123,42');
        });

        it('should store multiple values with a location', function () {
            node.setAttribute('alias', 'foo|bar', new Location('Foo.js', 123, 42));

            let a = node.getAttribute('alias');

            expect(a).to.equal([ 'foo', 'bar' ]);

            let loc = node.getAttributeLocation('alias');
            expect(loc).to.be.an('array');

            expect(loc).to.have.length(2);
            expect(loc[0].toString()).to.be('Foo.js:123:42');
            expect(loc[1].toString()).to.be('Foo.js:123:46');

            let src = node.getAttributeSrc('alias');
            expect(src).to.be('0,123,42:0,123,46');
        });
    });
});
