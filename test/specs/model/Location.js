'use strict';

/* global require, describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const Location = require('../../../lib/model/Location');

describe('model/Location', function () {
    describe('from', function () {
        it('should accept Location instance and return it', function () {
            let c = new Location('foo.js', 427, 13);
            let f = Location.from(c);

            expect(c === f).to.be(true);  // already a Location instance
        });

        it('should accept full Location', function () {
            let f = Location.from('foo.js:427:13');

            expect(f.file).to.equal('foo.js');
            expect(f.line).to.be(427);
            expect(f.column).to.be(13);
        });

        it('should accept Location without a column', function () {
            let f = Location.from('foo.js:427');

            expect(f.file).to.equal('foo.js');
            expect(f.line).to.be(427);
            expect(f.column).to.be(-1);
        });

        it('should accept Location without line or column', function () {
            let f = Location.from('foo.js');

            expect(f.file).to.equal('foo.js');
            expect(f.line).to.be(-1);
            expect(f.column).to.be(-1);
        });
    }); // from

    //TODO null handling esp null file in Location

    describe('new with path, line, column', function () {
        beforeEach(function () {
            this.loc = new Location('foo.js', 123, 42);
        });

        it('should have correct file path', function () {
            expect(this.loc.file).to.equal('foo.js');
        });

        it('should have correct line number', function () {
            expect(this.loc.line).to.be(123);
        });

        it('should have correct column', function () {
            expect(this.loc.column).to.be(42);
        });

        it('toString should be correct', function () {
            let s = this.loc.toString();

            expect(s).to.be('foo.js:123:42');
        });

        it('should advance() correctly', function () {
            let c = this.loc;

            c.advance();

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(124);
            expect(c.column).to.be(42);

            let s = c.toString();

            expect(s).to.be('foo.js:124:42');
        });

        it('should advance(10) correctly', function () {
            let c = this.loc;

            c.advance(10);

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(133);
            expect(c.column).to.be(42);

            let s = c.toString();

            expect(s).to.be('foo.js:133:42');
        });

        it('should advanceColumn() correctly', function () {
            let c = this.loc;

            c.advanceColumn();

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(123);
            expect(c.column).to.be(43);

            let s = c.toString();

            expect(s).to.be('foo.js:123:43');
        });

        it('should advanceColumn(10) correctly', function () {
            let c = this.loc;

            c.advanceColumn(10);

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(123);
            expect(c.column).to.be(52);

            let s = c.toString();

            expect(s).to.be('foo.js:123:52');
        });

        it('should clone correctly', function () {
            let c = this.loc.clone();

            expect(c === this.loc).to.be(false); // not the same instance
            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(123);
            expect(c.column).to.be(42);

            let s = c.toString();

            expect(s).to.be('foo.js:123:42');
        });

        it('should determine lineCount(10) correctly', function () {
            let n = this.loc.lineCount(10);

            expect(n).to.be(113);
        });

        it('should determine lineCount(loc+10) correctly', function () {
            let c = this.loc.clone().advance(10);
            let n = this.loc.lineCount(c);

            expect(n).to.be(10);
        });

        it('should determine lineCount(loc-20) correctly', function () {
            let c = this.loc.clone().advance(-20);
            let n = this.loc.lineCount(c);

            expect(n).to.be(20);
        });
    });

    describe('new with path, line, no column', function () {
        beforeEach(function () {
            this.loc = new Location('foo.js', 123);
        });

        it('should have correct file path', function () {
            expect(this.loc.file).to.equal('foo.js');
        });

        it('should have correct line number', function () {
            expect(this.loc.line).to.be(123);
        });

        it('should have correct column', function () {
            expect(this.loc.column).to.be(-1);
        });

        it('toString should be correct', function () {
            let s = this.loc.toString();

            expect(s).to.be('foo.js:123');
        });

        it('should advance() correctly', function () {
            let c = this.loc;

            c.advance();

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(124);
            expect(c.column).to.be(-1);

            let s = c.toString();

            expect(s).to.be('foo.js:124');
        });

        it('should advance(10) correctly', function () {
            let c = this.loc;

            c.advance(10);

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(133);
            expect(c.column).to.be(-1);

            let s = c.toString();

            expect(s).to.be('foo.js:133');
        });

        it('should advanceColumn() correctly', function () {
            let c = this.loc;

            c.advanceColumn();

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(123);
            expect(c.column).to.be(-1);

            let s = c.toString();

            expect(s).to.be('foo.js:123');
        });

        it('should advanceColumn(10) correctly', function () {
            let c = this.loc;

            c.advanceColumn(10);

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(123);
            expect(c.column).to.be(-1);

            let s = c.toString();

            expect(s).to.be('foo.js:123');
        });

        it('should clone correctly', function () {
            let c = this.loc.clone();

            expect(c === this.loc).to.be(false); // not the same instance
            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(123);
            expect(c.column).to.be(-1);

            let s = c.toString();

            expect(s).to.be('foo.js:123');
        });

        it('should determine lineCount(10) correctly', function () {
            let n = this.loc.lineCount(10);

            expect(n).to.be(113);
        });

        it('should determine lineCount(loc+10) correctly', function () {
            let c = this.loc.clone().advance(10);
            let n = this.loc.lineCount(c);

            expect(n).to.be(10);
        });

        it('should determine lineCount(loc-20) correctly', function () {
            let c = this.loc.clone().advance(-20);
            let n = this.loc.lineCount(c);

            expect(n).to.be(20);
        });
    });

    describe('new with path, no line, no column', function () {
        beforeEach(function () {
            this.loc = new Location('foo.js');
        });

        it('should have correct file path', function () {
            expect(this.loc.file).to.equal('foo.js');
        });

        it('should have correct line number', function () {
            expect(this.loc.line).to.be(-1);
        });

        it('should have correct column', function () {
            expect(this.loc.column).to.be(-1);
        });

        it('toString should be correct', function () {
            let s = this.loc.toString();

            expect(s).to.be('foo.js');
        });

        it('should advance() correctly', function () {
            let c = this.loc;

            c.advance();

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(-1);
            expect(c.column).to.be(-1);

            let s = c.toString();

            expect(s).to.be('foo.js');
        });

        it('should advance(10) correctly', function () {
            let c = this.loc;

            c.advance(10);

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(-1);
            expect(c.column).to.be(-1);

            let s = c.toString();

            expect(s).to.be('foo.js');
        });

        it('should advanceColumn() correctly', function () {
            let c = this.loc;

            c.advanceColumn();

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(-1);
            expect(c.column).to.be(-1);

            let s = c.toString();

            expect(s).to.be('foo.js');
        });

        it('should advanceColumn(10) correctly', function () {
            let c = this.loc;

            c.advanceColumn(10);

            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(-1);
            expect(c.column).to.be(-1);

            let s = c.toString();

            expect(s).to.be('foo.js');
        });

        it('should clone correctly', function () {
            let c = this.loc.clone();

            expect(c === this.loc).to.be(false); // not the same instance
            expect(c.file).to.equal('foo.js');
            expect(c.line).to.be(-1);
            expect(c.column).to.be(-1);

            let s = c.toString();

            expect(s).to.be('foo.js');
        });

        it('should determine lineCount(10) correctly', function () {
            let n = this.loc.lineCount(10);

            expect(n).to.be(-1);
        });

        it('should determine lineCount(loc+10) correctly', function () {
            let c = this.loc.clone().advance(10);
            let n = this.loc.lineCount(c);

            expect(n).to.be(-1);
        });

        it('should determine lineCount(loc-20) correctly', function () {
            let c = this.loc.clone().advance(-20);
            let n = this.loc.lineCount(c);

            expect(n).to.be(-1);
        });
    });
});
