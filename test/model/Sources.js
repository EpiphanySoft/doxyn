describe('model/Sources', function () {
    "use strict";

    const Location = require('../../lib/model/Location');
    const Sources = require('../../lib/model/Sources');
    const Chunk = Sources.Chunk;

    const FILES = [
        'Foo.js',
        'Bar.js',
        'Zip.js'
    ];

    describe('Chunk', function () {
        describe('fieldOf', function () {
            describe('1-tuple', function () {
                const STR = '0';

                it('should return field[0]', function () {
                    var n = Chunk.fieldOf(STR, 0);
                    expect(n).toBe(0);
                });

                it('should return -1 when indexing beyond end', function () {
                    var n = Chunk.fieldOf(STR, 1);
                    expect(n).toBe(-1);
                });
            });

            describe('2-tuple', function () {
                const STR = '21,427';

                it('should return field[0]', function () {
                    var n = Chunk.fieldOf(STR, 0);
                    expect(n).toBe(21);
                });

                it('should return field[1]', function () {
                    var n = Chunk.fieldOf(STR, 1);
                    expect(n).toBe(427);
                });

                it('should return -1 when indexing beyond end', function () {
                    var n = Chunk.fieldOf(STR, 2);
                    expect(n).toBe(-1);
                });
            });

            describe('3-tuple', function () {
                const STR = '42,123,321';

                it('should return field[0]', function () {
                    var n = Chunk.fieldOf(STR, 0);
                    expect(n).toBe(42);
                });

                it('should return field[1]', function () {
                    var n = Chunk.fieldOf(STR, 1);
                    expect(n).toBe(123);
                });

                it('should return field[2]', function () {
                    var n = Chunk.fieldOf(STR, 2);
                    expect(n).toBe(321);
                });

                it('should return -1 when indexing beyond end', function () {
                    var n = Chunk.fieldOf(STR, 3);
                    expect(n).toBe(-1);
                });
            });

            describe('4-tuple', function () {
                const STR = '4,5,6,7';

                it('should return field[0]', function () {
                    var n = Chunk.fieldOf(STR, 0);
                    expect(n).toBe(4);
                });

                it('should return field[1]', function () {
                    var n = Chunk.fieldOf(STR, 1);
                    expect(n).toBe(5);
                });

                it('should return field[2]', function () {
                    var n = Chunk.fieldOf(STR, 2);
                    expect(n).toBe(6);
                });

                it('should return field[3]', function () {
                    var n = Chunk.fieldOf(STR, 3);
                    expect(n).toBe(7);
                });

                it('should return -1 when indexing beyond end', function () {
                    var n = Chunk.fieldOf(STR, 4);
                    expect(n).toBe(-1);
                });
            });
        }); // fieldOf

        describe('from', function () {
            it('should parse a 3-tuple', function () {
                var c = Chunk.from('123,456,789');

                expect(c.file).toBe(123);
                expect(c.line).toBe(456);
                expect(c.column).toBe(789);
                expect(c.length).toBe(-1);
            });

            it('should parse a 4-tuple', function () {
                var c = Chunk.from('123,456,789,2468');

                expect(c.file).toBe(123);
                expect(c.line).toBe(456);
                expect(c.column).toBe(789);
                expect(c.length).toBe(2468);
            });
        });

        describe('from / init', function () {
            it('should support a 3-tuple', function () {
                var c = Chunk.from('1,456,789').init({ files: FILES }, 0);

                expect(c.file).toBe('Bar.js');
                expect(c.line).toBe(456);
                expect(c.column).toBe(789);
                expect(c.length).toBe(-1);
            });

            it('should parse a 4-tuple', function () {
                var c = Chunk.from('0,456,789,2468').init({ files: FILES }, 100);

                expect(c.file).toBe('Foo.js');
                expect(c.line).toBe(456);
                expect(c.column).toBe(789);
                expect(c.length).toBe(2468);
                expect(c.begin).toBe(100);
                expect(c.end).toBe(2468 + 100);
            });
        });
    }); // Chunk

    describe('Sources', function () {
        const A = 6;
        const B = 7;
        const C = 4;
        beforeEach(function () {
            this.src2 = new Sources(FILES, 'Hello World!!', `0,2,4,${A}:1,3,5,${B}`);
            this.src3 = new Sources(FILES, 'Hello World!! Yo!', `0,2,4,${A}:1,3,5,${B}:2,42,427,${C}`);
        });

        describe('first chunk', function () {
            it('should have correct file', function () {
                var c = this.src2.chunks[0];
                expect(c.file).toBe('Foo.js');
            });
            it('should have correct line', function () {
                var c = this.src2.chunks[0];
                expect(c.line).toBe(2);
            });
            it('should have correct column', function () {
                var c = this.src2.chunks[0];
                expect(c.column).toBe(4);
            });
            it('should have correct length', function () {
                var c = this.src2.chunks[0];
                expect(c.length).toBe(6);
            });
            it('should have correct begin', function () {
                var c = this.src2.chunks[0];
                expect(c.begin).toBe(0);
            });
            it('should have correct end', function () {
                var c = this.src2.chunks[0];
                expect(c.end).toBe(6);
            });
            it('should have the correct text', function () {
                var c = this.src2.chunks[0];
                expect(c.text).toBe('Hello ');
            });
        });

        describe('second chunk', function () {
            it('should have correct file', function () {
                var c = this.src2.chunks[1];
                expect(c.file).toBe('Bar.js');
            });
            it('should have correct line', function () {
                var c = this.src2.chunks[1];
                expect(c.line).toBe(3);
            });
            it('should have correct column', function () {
                var c = this.src2.chunks[1];
                expect(c.column).toBe(5);
            });
            it('should have correct length', function () {
                var c = this.src2.chunks[1];
                expect(c.length).toBe(7);
            });
            it('should have correct begin', function () {
                var c = this.src2.chunks[1];
                expect(c.begin).toBe(6);
            });
            it('should have correct end', function () {
                var c = this.src2.chunks[1];
                expect(c.end).toBe(6+7);
            });
            it('should have the correct text', function () {
                var c = this.src2.chunks[1];
                expect(c.text).toBe('World!!');
            });
        });
        
        describe('chunkIndexFromOffset', function () {
            it('should handle offset -1', function () {
                var c = this.src2.chunkIndexFromOffset(-1);
                expect(c).toBe(-1);

                c = this.src2.chunkFromOffset(-1);
                expect(c).toBe(null);
            });

            it('should handle offset 0', function () {
                var c = this.src2.chunkIndexFromOffset(0);
                expect(c).toBe(0);

                c = this.src2.chunkFromOffset(0);
                expect(c.text).toBe('Hello ');
            });

            it('should handle offset of boundary-1', function () {
                var c = this.src2.chunkIndexFromOffset(A-1);
                expect(c).toBe(0);
            });

            it('should handle offset of boundary', function () {
                var c = this.src2.chunkIndexFromOffset(A);
                expect(c).toBe(1);

                c = this.src2.chunkFromOffset(A);
                expect(c.text).toBe('World!!');
            });

            it('should handle offset of boundary+1', function () {
                var c = this.src2.chunkIndexFromOffset(A+1);
                expect(c).toBe(1);
            });

            it('should handle offset of end-1', function () {
                var c = this.src2.chunkIndexFromOffset(A+B-1);
                expect(c).toBe(1);
            });

            it('should handle offset of end', function () {
                var c = this.src2.chunkIndexFromOffset(A+B);
                expect(c).toBe(-1);

                c = this.src2.chunkFromOffset(A+B);
                expect(c).toBe(null);
            });

            it('should handle offset of end+1', function () {
                var c = this.src2.chunkIndexFromOffset(A+B+1);
                expect(c).toBe(-1);
            });
        }); // chunkIndexFromOffset

        describe('erase', function () {
            describe('offset 0', function () {
                it('should handle less then first chunk size', function () {
                    this.src2.erase(0, 3);

                    var s = this.src2.toString();
                    expect(s).toBe(`0,2,4,${A-3}:1,3,5,${B}`);
                    expect(this.src2.text).toBe('lo World!!');
                });

                it('should handle almost first chunk size', function () {
                    this.src2.erase(0, A-1);

                    var s = this.src2.toString();
                    expect(s).toBe(`0,2,4,1:1,3,5,${B}`);
                    expect(this.src2.text).toBe(' World!!');
                });

                it('should handle exactly first chunk size', function () {
                    this.src2.erase(0, A);

                    var s = this.src2.toString();
                    expect(s).toBe(`1,3,5,${B}`);
                    expect(this.src2.text).toBe('World!!');
                });
            });

            describe('offset first half of first chunk', function () {
                it('should handle less then first chunk size', function () {
                    this.src2.erase(1, 3);

                    var s = this.src2.toString();
                    expect(s).toBe(`0,2,4,${A-3}:1,3,5,${B}`);
                    expect(this.src2.text).toBe('Ho World!!');
                });

                it('should handle almost first chunk size', function () {
                    this.src2.erase(1, A-2);

                    var s = this.src2.toString();
                    expect(s).toBe(`0,2,4,2:1,3,5,${B}`);
                    expect(this.src2.text).toBe('H World!!');
                });

                it('should handle exactly first chunk size', function () {
                    this.src2.erase(1, A-1);

                    var s = this.src2.toString();
                    expect(s).toBe(`0,2,4,1:1,3,5,${B}`);
                    expect(this.src2.text).toBe('HWorld!!');
                });

                it('should handle one char of second chunk size', function () {
                    this.src2.erase(1, A);

                    var s = this.src2.toString();
                    expect(s).toBe(`0,2,4,1:1,3,5,${B-1}`);
                    expect(this.src2.text).toBe('Horld!!');
                });
            });

            describe('multi-chunk', function () {
                it('should remove middle chunk on exact erase', function () {
                    this.src3.erase(A, B);

                    var s = this.src3.toString();
                    expect(s).toBe(`0,2,4,${A}:2,42,427,${C}`);
                    expect(this.src3.text).toBe('Hello  Yo!');
                });

                it('should remove middle chunk on cross-over w/exact end', function () {
                    this.src3.erase(A-1, B+1);

                    var s = this.src3.toString();
                    expect(s).toBe(`0,2,4,${A-1}:2,42,427,${C}`);
                    expect(this.src3.text).toBe('Hello Yo!');
                });

                it('should remove middle chunk on overflow by 1', function () {
                    this.src3.erase(A, B+1);

                    var s = this.src3.toString();
                    expect(s).toBe(`0,2,4,${A}:2,42,427,${C-1}`);
                    expect(this.src3.text).toBe('Hello Yo!');
                });

                it('should remove middle chunk on cross-over w/overflow by 1', function () {
                    this.src3.erase(A-1, B+2);

                    var s = this.src3.toString();
                    expect(this.src3.text).toBe('HelloYo!');
                    expect(s).toBe(`0,2,4,${A-1}:2,42,427,${C-1}`);
                });

                it('should remove middle and most of last chunk', function () {
                    this.src3.erase(A-1, B+C);

                    var s = this.src3.toString();
                    expect(this.src3.text).toBe('Hello!');
                    expect(s).toBe(`0,2,4,${A-1}:2,42,427,1`);
                });

                it('should remove middle and last chunk', function () {
                    this.src3.erase(A-1, B+C+1);

                    var s = this.src3.toString();
                    expect(this.src3.text).toBe('Hello');
                    expect(s).toBe(`0,2,4,${A-1}`);
                });
            });
        });
    }); // Sources
});
