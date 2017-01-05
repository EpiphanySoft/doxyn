'use strict';

/* global require, describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const List = require('../../lib/List');

describe('List', function () {
    describe('building', function () {
        it('should be able to add one item', function () {
            let list = new List();
            let item = {};

            list.append(item);

            expect(list).to.have.length(1);

            expect(list.first).to.be(item);
            expect(list.last).to.be(item);
        });

        it('should be able to append two items', function () {
            let list = new List();
            let a = {};
            let b = {};

            list.append(a);
            list.append(b);

            expect(list).to.have.length(2);

            expect(list.first).to.be(a);
            expect(list.last).to.be(b);

            expect(a.next).to.be(b);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(null);
            expect(b.prev).to.be(a);
        });

        it('should be able to append/insert two items', function () {
            let list = new List();
            let a = {};
            let b = {};

            list.append(a);
            list.insert(b, a);

            expect(list).to.have.length(2);

            expect(list.first).to.be(b);
            expect(list.last).to.be(a);

            expect(a.next).to.be(null);
            expect(a.prev).to.be(b);

            expect(b.next).to.be(a);
            expect(b.prev).to.be(null);
        });

        it('should be able to add 3 items', function () {
            let list = new List();
            let a = {};
            let b = {};
            let c = {};

            list.append(b);
            list.insert(a, b);
            list.append(c);

            expect(list).to.have.length(3);

            expect(list.first).to.be(a);
            expect(list.last).to.be(c);

            expect(a.next).to.be(b);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(c);
            expect(b.prev).to.be(a);

            expect(c.next).to.be(null);
            expect(c.prev).to.be(b);
        });
    });

    describe('remove', function () {
        let a, b, c, list;

        beforeEach(function () {
            list = new List();

            list.append(a = {});
            list.append(b = {});
            list.append(c = {});

            expect(list).to.have.length(3);

            expect(list.first).to.be(a);
            expect(list.last).to.be(c);

            expect(a.next).to.be(b);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(c);
            expect(b.prev).to.be(a);

            expect(c.next).to.be(null);
            expect(c.prev).to.be(b);
        });

        it('should be able to remove first of 3 items', function () {
            list.remove(a);

            expect(list).to.have.length(2);

            expect(list.first).to.be(b);
            expect(list.last).to.be(c);

            expect(a.next).to.be(null);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(c);
            expect(b.prev).to.be(null);

            expect(c.next).to.be(null);
            expect(c.prev).to.be(b);
        });

        it('should be able to remove the middle of 3 items', function () {
            list.remove(b);

            expect(list).to.have.length(2);

            expect(list.first).to.be(a);
            expect(list.last).to.be(c);

            expect(a.next).to.be(c);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(null);
            expect(b.prev).to.be(null);

            expect(c.next).to.be(null);
            expect(c.prev).to.be(a);
        });

        it('should be able to remove last of 3 items', function () {
            list.remove(c);

            expect(list).to.have.length(2);

            expect(list.first).to.be(a);
            expect(list.last).to.be(b);

            expect(a.next).to.be(b);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(null);
            expect(b.prev).to.be(a);

            expect(c.next).to.be(null);
            expect(c.prev).to.be(null);
        });

        it('should be able to remove all 3 items', function () {
            list.remove(b);

            expect(list).to.have.length(2);

            expect(list.first).to.be(a);
            expect(list.last).to.be(c);

            expect(a.next).to.be(c);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(null);
            expect(b.prev).to.be(null);

            expect(c.next).to.be(null);
            expect(c.prev).to.be(a);

            list.remove(c);

            expect(list).to.have.length(1);

            expect(list.first).to.be(a);
            expect(list.last).to.be(a);

            expect(a.next).to.be(null);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(null);
            expect(b.prev).to.be(null);

            expect(c.next).to.be(null);
            expect(c.prev).to.be(null);

            list.remove(a);

            expect(list).to.have.length(0);

            expect(list.first).to.be(null);
            expect(list.last).to.be(null);

            expect(a.next).to.be(null);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(null);
            expect(b.prev).to.be(null);

            expect(c.next).to.be(null);
            expect(c.prev).to.be(null);
        });
    });
});
