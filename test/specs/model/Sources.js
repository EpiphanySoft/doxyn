'use strict';

/* global describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const Location = require('../../../lib/model/Location');
const Sources = require('../../../lib/model/Sources');
const Chunk = Sources.Chunk;

describe('model/Sources', function () {
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
                    let n = Chunk.fieldOf(STR, 0);
                    expect(n).to.be(0);
                });

                it('should return -1 when indexing beyond end', function () {
                    let n = Chunk.fieldOf(STR, 1);
                    expect(n).to.be(-1);
                });
            });

            describe('2-tuple', function () {
                const STR = '21,427';

                it('should return field[0]', function () {
                    let n = Chunk.fieldOf(STR, 0);
                    expect(n).to.be(21);
                });

                it('should return field[1]', function () {
                    let n = Chunk.fieldOf(STR, 1);
                    expect(n).to.be(427);
                });

                it('should return -1 when indexing beyond end', function () {
                    let n = Chunk.fieldOf(STR, 2);
                    expect(n).to.be(-1);
                });
            });

            describe('3-tuple', function () {
                const STR = '42,123,321';

                it('should return field[0]', function () {
                    let n = Chunk.fieldOf(STR, 0);
                    expect(n).to.be(42);
                });

                it('should return field[1]', function () {
                    let n = Chunk.fieldOf(STR, 1);
                    expect(n).to.be(123);
                });

                it('should return field[2]', function () {
                    let n = Chunk.fieldOf(STR, 2);
                    expect(n).to.be(321);
                });

                it('should return -1 when indexing beyond end', function () {
                    let n = Chunk.fieldOf(STR, 3);
                    expect(n).to.be(-1);
                });
            });

            describe('4-tuple', function () {
                const STR = '4,5,6,7';

                it('should return field[0]', function () {
                    let n = Chunk.fieldOf(STR, 0);
                    expect(n).to.be(4);
                });

                it('should return field[1]', function () {
                    let n = Chunk.fieldOf(STR, 1);
                    expect(n).to.be(5);
                });

                it('should return field[2]', function () {
                    let n = Chunk.fieldOf(STR, 2);
                    expect(n).to.be(6);
                });

                it('should return field[3]', function () {
                    let n = Chunk.fieldOf(STR, 3);
                    expect(n).to.be(7);
                });

                it('should return -1 when indexing beyond end', function () {
                    let n = Chunk.fieldOf(STR, 4);
                    expect(n).to.be(-1);
                });
            });
        }); // fieldOf

        describe('from', function () {
            it('should parse a 3-tuple', function () {
                let c = Chunk.from('123,456,789');

                expect(c.file).to.be(123);
                expect(c.line).to.be(456);
                expect(c.column).to.be(789);
                expect(c.length).to.be(-1);
            });

            it('should parse a 4-tuple', function () {
                let c = Chunk.from('123,456,789,2468');

                expect(c.file).to.be(123);
                expect(c.line).to.be(456);
                expect(c.column).to.be(789);
                expect(c.length).to.be(2468);
            });
        });

        describe('from / init', function () {
            it('should support a 3-tuple', function () {
                let c = Chunk.from('1,456,789').init({ files: FILES }, 0);

                expect(c.file).to.be('Bar.js');
                expect(c.line).to.be(456);
                expect(c.column).to.be(789);
                expect(c.length).to.be(-1);
            });

            it('should parse a 4-tuple', function () {
                let c = Chunk.from('0,456,789,2468').init({ files: FILES }, 100);

                expect(c.file).to.be('Foo.js');
                expect(c.line).to.be(456);
                expect(c.column).to.be(789);
                expect(c.length).to.be(2468);
                expect(c.begin).to.be(100);
                expect(c.end).to.be(2468 + 100);
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
            this.src4 = new Sources(FILES, 'He\nlo Wo\nld\n! Y\n!', `0,2,4,${A}:1,3,5,${B}:2,42,427,${C}`);
        });

        describe('first chunk', function () {
            it('should have correct file', function () {
                let c = this.src2.chunks[0];
                expect(c.file).to.be('Foo.js');
            });
            it('should have correct line', function () {
                let c = this.src2.chunks[0];
                expect(c.line).to.be(2);
            });
            it('should have correct column', function () {
                let c = this.src2.chunks[0];
                expect(c.column).to.be(4);
            });
            it('should have correct length', function () {
                let c = this.src2.chunks[0];
                expect(c.length).to.be(6);
            });
            it('should have correct begin', function () {
                let c = this.src2.chunks[0];
                expect(c.begin).to.be(0);
            });
            it('should have correct end', function () {
                let c = this.src2.chunks[0];
                expect(c.end).to.be(6);
            });
            it('should have the correct text', function () {
                let c = this.src2.chunks[0];
                expect(c.text).to.be('Hello ');
            });

            it('should have correct lineCount', function () {
                let c = this.src2.chunks[0];
                let n = c.lineCount();
                expect(n).to.be(1);

                c = this.src3.chunks[0];
                n = c.lineCount();
                expect(n).to.be(1);

                c = this.src4.chunks[0];
                n = c.lineCount();
                expect(n).to.be(2);
            });

            it('should have correct lineLength', function () {
                let c = this.src2.chunks[0];
                let n = c.lineLength(0);
                expect(n).to.be(A);

                c = this.src3.chunks[0];
                n = c.lineLength(0);
                expect(n).to.be(A);

                c = this.src4.chunks[0];
                n = c.lineLength(0);
                expect(n).to.be(3);
                n = c.lineLength(1);
                expect(n).to.be(3);
                n = c.lineLength(2);
                expect(n).to.be(-1);
            });

            it('should be able to split offsets into lines and columns', function () {
                let c = this.src4.chunks[0];
                let [line, col] = c.splitOffset(1);

                expect(line).to.be(0);
                expect(col).to.be(1);

                [line, col] = c.splitOffset(3);

                expect(line).to.be(1);
                expect(col).to.be(0);

                [line, col] = c.splitOffset(4);

                expect(line).to.be(1);
                expect(col).to.be(1);

                [line, col] = c.splitOffset(5);

                expect(line).to.be(1);
                expect(col).to.be(2);
            });

            it('should be able to splitChunkByLine', function () {
                let src = this.src4;
                let c = src.chunks[0];
                let next = src.splitChunkByLine(c, 1);
                let s = src.toString();

                expect(s).to.be(`0,2,4,${A/2}:0,3,4,${A/2}:1,3,5,${B}:2,42,427,${C}`);
            });
        });

        describe('second chunk', function () {
            it('should have correct file', function () {
                let c = this.src2.chunks[1];
                expect(c.file).to.be('Bar.js');
            });
            it('should have correct line', function () {
                let c = this.src2.chunks[1];
                expect(c.line).to.be(3);
            });
            it('should have correct column', function () {
                let c = this.src2.chunks[1];
                expect(c.column).to.be(5);
            });
            it('should have correct length', function () {
                let c = this.src2.chunks[1];
                expect(c.length).to.be(7);
            });
            it('should have correct begin', function () {
                let c = this.src2.chunks[1];
                expect(c.begin).to.be(6);
            });
            it('should have correct end', function () {
                let c = this.src2.chunks[1];
                expect(c.end).to.be(6+7);
            });
            it('should have the correct text', function () {
                let c = this.src2.chunks[1];
                expect(c.text).to.be('World!!');
            });
        });

        describe('at', function () {
            describe('first block', function () {
                it('should handle offset 0', function () {debugger
                    let c = this.src4.at(0);
                    let s = c.toString();

                    expect(s).to.be('Foo.js:2:4');
                });

                it('should handle offset 3', function () {
                    let c = this.src4.at(3);
                    let s = c.toString();

                    expect(s).to.be('Foo.js:3:4');
                });

                it('should handle offset 0, full size', function () {
                    let c = this.src4.at(3);
                    let s = c.toString();

                    expect(s).to.be('Foo.js:3:4');
                });

                it('should handle offset -1 from end', function () {
                    let c = this.src4.at(A-1);
                    let s = c.toString();

                    expect(s).to.be('Foo.js:3:6');
                });
            });
        }); // at
        
        describe('chunkIndexFromOffset', function () {
            it('should handle offset -1', function () {
                let c = this.src2.chunkIndexFromOffset(-1);
                expect(c).to.be(-1);

                c = this.src2.chunkFromOffset(-1);
                expect(c).to.be(null);
            });

            it('should handle offset 0', function () {
                let c = this.src2.chunkIndexFromOffset(0);
                expect(c).to.be(0);

                c = this.src2.chunkFromOffset(0);
                expect(c.text).to.be('Hello ');
            });

            it('should handle offset of boundary-1', function () {
                let c = this.src2.chunkIndexFromOffset(A-1);
                expect(c).to.be(0);
            });

            it('should handle offset of boundary', function () {
                let c = this.src2.chunkIndexFromOffset(A);
                expect(c).to.be(1);

                c = this.src2.chunkFromOffset(A);
                expect(c.text).to.be('World!!');
            });

            it('should handle offset of boundary+1', function () {
                let c = this.src2.chunkIndexFromOffset(A+1);
                expect(c).to.be(1);
            });

            it('should handle offset of end-1', function () {
                let c = this.src2.chunkIndexFromOffset(A+B-1);
                expect(c).to.be(1);
            });

            it('should handle offset of end', function () {
                let c = this.src2.chunkIndexFromOffset(A+B);
                expect(c).to.be(-1);

                c = this.src2.chunkFromOffset(A+B);
                expect(c).to.be(null);
            });

            it('should handle offset of end+1', function () {
                let c = this.src2.chunkIndexFromOffset(A+B+1);
                expect(c).to.be(-1);
            });
        }); // chunkIndexFromOffset

        describe('spans', function () {
            describe('first block', function () {
                it('should handle offset 0, length 1', function () {
                    let c = this.src3.chunks[0];

                    expect(c.spans(0)).to.be(true);
                });

                it('should handle offset 0, length 3', function () {
                    let c = this.src3.chunks[0];

                    expect(c.spans(0, 3)).to.be(true);
                });

                it('should handle offset 0, full size', function () {
                    let c = this.src3.chunks[0];

                    expect(c.spans(0, A)).to.be(true);
                });

                it('should handle offset 0, overflow', function () {
                    let c = this.src3.chunks[0];

                    expect(c.spans(0, A+1)).to.be(false);
                });

                it('should handle offset 1, overflow', function () {
                    let c = this.src3.chunks[0];

                    expect(c.spans(1, A)).to.be(false);
                });

                it('should handle offset -1 from end', function () {
                    let c = this.src3.chunks[0];

                    expect(c.spans(A-1)).to.be(true);
                });

                it('should handle offset 1 beyond end', function () {
                    let c = this.src3.chunks[0];

                    expect(c.spans(A)).to.be(false);
                });
            });

            describe('second block', function () {
                it('should handle offset 0, length 1', function () {
                    let c = this.src3.chunks[1];

                    expect(c.spans(A)).to.be(true);
                });

                it('should handle offset 0, length 3', function () {
                    let c = this.src3.chunks[1];

                    expect(c.spans(A, 3)).to.be(true);
                });

                it('should handle offset 0, full size', function () {
                    let c = this.src3.chunks[1];

                    expect(c.spans(A, B)).to.be(true);
                });

                it('should handle offset 0, overflow', function () {
                    let c = this.src3.chunks[1];

                    expect(c.spans(A, B+1)).to.be(false);
                });

                it('should handle offset 1, overflow', function () {
                    let c = this.src3.chunks[1];

                    expect(c.spans(A+1, B)).to.be(false);
                });

                it('should handle offset -1 from end', function () {
                    let c = this.src3.chunks[1];

                    expect(c.spans(A+B-1)).to.be(true);
                });

                it('should handle offset 1 beyond end', function () {
                    let c = this.src3.chunks[1];

                    expect(c.spans(A+B)).to.be(false);
                });
            });

            describe('last block', function () {
                it('should handle offset 0, length 1', function () {
                    let c = this.src3.chunks[2];

                    expect(c.spans(A+B)).to.be(true);
                });

                it('should handle offset 0, length 3', function () {
                    let c = this.src3.chunks[2];

                    expect(c.spans(A+B, 2)).to.be(true);
                });

                it('should handle offset 0, full size', function () {
                    let c = this.src3.chunks[2];

                    expect(c.spans(A+B, C)).to.be(true);
                });

                it('should handle offset 0, overflow', function () {
                    let c = this.src3.chunks[2];

                    expect(c.spans(A+B, C+1)).to.be(false);
                });

                it('should handle offset 1, overflow', function () {
                    let c = this.src3.chunks[2];

                    expect(c.spans(A+B+1, C)).to.be(false);
                });

                it('should handle offset -1 from end', function () {
                    let c = this.src3.chunks[2];

                    expect(c.spans(A+B+C-1)).to.be(true);
                });

                it('should handle offset 1 beyond end', function () {
                    let c = this.src3.chunks[2];

                    expect(c.spans(A+B+C)).to.be(false);
                });
            });
        }); // spans
    }); // Sources
});
