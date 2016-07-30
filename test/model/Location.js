const Location = require('../../lib/model/Location');

describe('model/Location', function () {
    describe('from', function () {
        it('should accept Location instance and return it', function () {
            var c = new Location('foo.js', 427, 13);
            var f = Location.from(c);

            expect(c === f).toBe(true);  // already a Location instance
        });

        it('should accept full Location', function () {
            var f = Location.from('foo.js:427:13');

            expect(f.file).toBe('foo.js');
            expect(f.line).toBe(427);
            expect(f.column).toBe(13);
        });

        it('should accept Location without a column', function () {
            var f = Location.from('foo.js:427');

            expect(f.file).toBe('foo.js');
            expect(f.line).toBe(427);
            expect(f.column).toBe(-1);
        });

        it('should accept Location without line or column', function () {
            var f = Location.from('foo.js');

            expect(f.file).toBe('foo.js');
            expect(f.line).toBe(-1);
            expect(f.column).toBe(-1);
        });
    });

    describe('new with path, line, column', function () {
        beforeEach(function () {
            this.loc = new Location('foo.js', 123, 42);
        });

        it('should have correct file path', function () {
            expect(this.loc.file).toBe('foo.js');
        });

        it('should have correct line number', function () {
            expect(this.loc.line).toBe(123);
        });

        it('should have correct column', function () {
            expect(this.loc.column).toBe(42);
        });

        it('toString should be correct', function () {
            var s = this.loc.toString();

            expect(s).toBe('foo.js:123:42');
        });

        it('should advance() correctly', function () {
            var c = this.loc;

            c.advance();

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(124);
            expect(c.column).toBe(42);

            var s = c.toString();

            expect(s).toBe('foo.js:124:42');
        });

        it('should advance(10) correctly', function () {
            var c = this.loc;

            c.advance(10);

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(133);
            expect(c.column).toBe(42);

            var s = c.toString();

            expect(s).toBe('foo.js:133:42');
        });

        it('should advanceColumn() correctly', function () {
            var c = this.loc;

            c.advanceColumn();

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(123);
            expect(c.column).toBe(43);

            var s = c.toString();

            expect(s).toBe('foo.js:123:43');
        });

        it('should advanceColumn(10) correctly', function () {
            var c = this.loc;

            c.advanceColumn(10);

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(123);
            expect(c.column).toBe(52);

            var s = c.toString();

            expect(s).toBe('foo.js:123:52');
        });

        it('should clone correctly', function () {
            var c = this.loc.clone();

            expect(c === this.loc).toBe(false); // not the same instance
            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(123);
            expect(c.column).toBe(42);

            var s = c.toString();

            expect(s).toBe('foo.js:123:42');
        });

        it('should determine lineCount(10) correctly', function () {
            var n = this.loc.lineCount(10);

            expect(n).toBe(113);
        });

        it('should determine lineCount(loc+10) correctly', function () {
            var c = this.loc.clone().advance(10);
            var n = this.loc.lineCount(c);

            expect(n).toBe(10);
        });

        it('should determine lineCount(loc-20) correctly', function () {
            var c = this.loc.clone().advance(-20);
            var n = this.loc.lineCount(c);

            expect(n).toBe(20);
        });
    });

    describe('new with path, line, no column', function () {
        beforeEach(function () {
            this.loc = new Location('foo.js', 123);
        });

        it('should have correct file path', function () {
            expect(this.loc.file).toBe('foo.js');
        });

        it('should have correct line number', function () {
            expect(this.loc.line).toBe(123);
        });

        it('should have correct column', function () {
            expect(this.loc.column).toBe(-1);
        });

        it('toString should be correct', function () {
            var s = this.loc.toString();

            expect(s).toBe('foo.js:123');
        });

        it('should advance() correctly', function () {
            var c = this.loc;

            c.advance();

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(124);
            expect(c.column).toBe(-1);

            var s = c.toString();

            expect(s).toBe('foo.js:124');
        });

        it('should advance(10) correctly', function () {
            var c = this.loc;

            c.advance(10);

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(133);
            expect(c.column).toBe(-1);

            var s = c.toString();

            expect(s).toBe('foo.js:133');
        });

        it('should advanceColumn() correctly', function () {
            var c = this.loc;

            c.advanceColumn();

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(123);
            expect(c.column).toBe(-1);

            var s = c.toString();

            expect(s).toBe('foo.js:123');
        });

        it('should advanceColumn(10) correctly', function () {
            var c = this.loc;

            c.advanceColumn(10);

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(123);
            expect(c.column).toBe(-1);

            var s = c.toString();

            expect(s).toBe('foo.js:123');
        });

        it('should clone correctly', function () {
            var c = this.loc.clone();

            expect(c === this.loc).toBe(false); // not the same instance
            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(123);
            expect(c.column).toBe(-1);

            var s = c.toString();

            expect(s).toBe('foo.js:123');
        });

        it('should determine lineCount(10) correctly', function () {
            var n = this.loc.lineCount(10);

            expect(n).toBe(113);
        });

        it('should determine lineCount(loc+10) correctly', function () {
            var c = this.loc.clone().advance(10);
            var n = this.loc.lineCount(c);

            expect(n).toBe(10);
        });

        it('should determine lineCount(loc-20) correctly', function () {
            var c = this.loc.clone().advance(-20);
            var n = this.loc.lineCount(c);

            expect(n).toBe(20);
        });
    });

    describe('new with path, no line, no column', function () {
        beforeEach(function () {
            this.loc = new Location('foo.js');
        });

        it('should have correct file path', function () {
            expect(this.loc.file).toBe('foo.js');
        });

        it('should have correct line number', function () {
            expect(this.loc.line).toBe(-1);
        });

        it('should have correct column', function () {
            expect(this.loc.column).toBe(-1);
        });

        it('toString should be correct', function () {
            var s = this.loc.toString();

            expect(s).toBe('foo.js');
        });

        it('should advance() correctly', function () {
            var c = this.loc;

            c.advance();

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(-1);
            expect(c.column).toBe(-1);

            var s = c.toString();

            expect(s).toBe('foo.js');
        });

        it('should advance(10) correctly', function () {
            var c = this.loc;

            c.advance(10);

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(-1);
            expect(c.column).toBe(-1);

            var s = c.toString();

            expect(s).toBe('foo.js');
        });

        it('should advanceColumn() correctly', function () {
            var c = this.loc;

            c.advanceColumn();

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(-1);
            expect(c.column).toBe(-1);

            var s = c.toString();

            expect(s).toBe('foo.js');
        });

        it('should advanceColumn(10) correctly', function () {
            var c = this.loc;

            c.advanceColumn(10);

            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(-1);
            expect(c.column).toBe(-1);

            var s = c.toString();

            expect(s).toBe('foo.js');
        });

        it('should clone correctly', function () {
            var c = this.loc.clone();

            expect(c === this.loc).toBe(false); // not the same instance
            expect(c.file).toBe('foo.js');
            expect(c.line).toBe(-1);
            expect(c.column).toBe(-1);

            var s = c.toString();

            expect(s).toBe('foo.js');
        });

        it('should determine lineCount(10) correctly', function () {
            var n = this.loc.lineCount(10);

            expect(n).toBe(-1);
        });

        it('should determine lineCount(loc+10) correctly', function () {
            var c = this.loc.clone().advance(10);
            var n = this.loc.lineCount(c);

            expect(n).toBe(-1);
        });

        it('should determine lineCount(loc-20) correctly', function () {
            var c = this.loc.clone().advance(-20);
            var n = this.loc.lineCount(c);

            expect(n).toBe(-1);
        });
    });
});
