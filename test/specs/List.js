'use strict';

/* global require, describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const List = require('../../lib/List');

describe('List', function () {
    let a, b, c, list;

    beforeEach(function () {
        list = new List();

        a = {};
        b = {};
        c = {};
    });

    describe('building', function () {
        it('should be able to add one item', function () {
            list.append(a);

            expect(list).to.have.length(1);

            expect(list.contains(a)).to.be(true);

            expect(list.first).to.be(a);
            expect(list.last).to.be(a);
        });

        it('should be able to append two items', function () {
            list.append(a);
            list.append(b);

            expect(list).to.have.length(2);

            expect(list.contains(a)).to.be(true);
            expect(list.contains(b)).to.be(true);

            expect(list.first).to.be(a);
            expect(list.last).to.be(b);

            expect(a.next).to.be(b);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(null);
            expect(b.prev).to.be(a);
        });

        it('should be able to append/insert two items', function () {
            list.append(a);
            list.insert(b, a);

            expect(list).to.have.length(2);

            expect(list.contains(a)).to.be(true);
            expect(list.contains(b)).to.be(true);

            expect(list.first).to.be(b);
            expect(list.last).to.be(a);

            expect(a.next).to.be(null);
            expect(a.prev).to.be(b);

            expect(b.next).to.be(a);
            expect(b.prev).to.be(null);
        });

        it('should be able to append/insert/append 3 items', function () {
            list.append(b);
            list.insert(a, b);
            list.append(c);

            expect(list).to.have.length(3);

            expect(list.contains(a)).to.be(true);
            expect(list.contains(b)).to.be(true);
            expect(list.contains(c)).to.be(true);

            expect(list.first).to.be(a);
            expect(list.last).to.be(c);

            expect(a.next).to.be(b);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(c);
            expect(b.prev).to.be(a);

            expect(c.next).to.be(null);
            expect(c.prev).to.be(b);
        });

        it('should be able to append/append/insert 3 items', function () {
            list.append(a);
            list.append(c);
            list.insert(b, c);

            expect(list).to.have.length(3);

            expect(list.contains(a)).to.be(true);
            expect(list.contains(b)).to.be(true);
            expect(list.contains(c)).to.be(true);

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
        beforeEach(function () {
            list.append(a);
            list.append(b);
            list.append(c);

            expect(list).to.have.length(3);

            expect(list.first).to.be(a);
            expect(list.last).to.be(c);

            expect(list).to.contain(a, 0);
            expect(list).to.contain(b, 1);
            expect(list).to.contain(c, 2);

            expect(list.contains(a)).to.be(true);
            expect(list.contains(b)).to.be(true);
            expect(list.contains(c)).to.be(true);

            expect(list.indexOf(a)).to.be(0);
            expect(list.indexOf(b)).to.be(1);
            expect(list.indexOf(c)).to.be(2);

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

            expect(list).to.not.contain(a);
            expect(list).to.contain(b);
            expect(list).to.contain(c);

            expect(list.contains(a)).to.be(false);
            expect(list.contains(b)).to.be(true);
            expect(list.contains(c)).to.be(true);

            expect(list.indexOf(a)).to.be(-1);
            expect(list.indexOf(b)).to.be(0);
            expect(list.indexOf(c)).to.be(1);

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

            expect(list).to.contain(a);
            expect(list).to.not.contain(b);
            expect(list).to.contain(c);

            expect(list.contains(a)).to.be(true);
            expect(list.contains(b)).to.be(false);
            expect(list.contains(c)).to.be(true);

            expect(list.indexOf(a)).to.be(0);
            expect(list.indexOf(b)).to.be(-1);
            expect(list.indexOf(c)).to.be(1);

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

            expect(list).to.contain(a);
            expect(list).to.contain(b);
            expect(list).to.not.contain(c);

            expect(list.contains(a)).to.be(true);
            expect(list.contains(b)).to.be(true);
            expect(list.contains(c)).to.be(false);

            expect(list.indexOf(a)).to.be(0);
            expect(list.indexOf(b)).to.be(1);
            expect(list.indexOf(c)).to.be(-1);

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

            expect(list).to.contain(a);
            expect(list).to.not.contain(b);
            expect(list).to.contain(c);

            expect(list.contains(a)).to.be(true);
            expect(list.contains(b)).to.be(false);
            expect(list.contains(c)).to.be(true);

            expect(list.indexOf(a)).to.be(0);
            expect(list.indexOf(b)).to.be(-1);
            expect(list.indexOf(c)).to.be(1);

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

            expect(list).to.contain(a);
            expect(list).to.not.contain(b);
            expect(list).to.not.contain(c);

            expect(list.contains(a)).to.be(true);
            expect(list.contains(b)).to.be(false);
            expect(list.contains(c)).to.be(false);

            expect(list.indexOf(a)).to.be(0);
            expect(list.indexOf(b)).to.be(-1);
            expect(list.indexOf(c)).to.be(-1);

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

            expect(list).to.not.contain(a);
            expect(list).to.not.contain(b);
            expect(list).to.not.contain(c);

            expect(list.contains(a)).to.be(false);
            expect(list.contains(b)).to.be(false);
            expect(list.contains(c)).to.be(false);

            expect(list.indexOf(a)).to.be(-1);
            expect(list.indexOf(b)).to.be(-1);
            expect(list.indexOf(c)).to.be(-1);

            expect(a.next).to.be(null);
            expect(a.prev).to.be(null);

            expect(b.next).to.be(null);
            expect(b.prev).to.be(null);

            expect(c.next).to.be(null);
            expect(c.prev).to.be(null);
        });
    });
});
