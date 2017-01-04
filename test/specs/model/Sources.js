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
                let [line, col] = c.offsetToLineColumn(1);

                expect(line).to.be(0);
                expect(col).to.be(1);

                [line, col] = c.offsetToLineColumn(3);

                expect(line).to.be(1);
                expect(col).to.be(0);

                [line, col] = c.offsetToLineColumn(4);

                expect(line).to.be(1);
                expect(col).to.be(1);

                [line, col] = c.offsetToLineColumn(5);

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
                it('should handle offset 0', function () {
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

        describe('split and replace', function () {
            const A0 = 6;
            const A1 = 22;
            const A2 = 22;
            const A = A0 + A1 + A2;

            const B0 = 22;
            const B1 = 21;
            const B = B0 + B1;

            const C = 29;

            beforeEach(function () {
                this.src = new Sources(FILES,
                    //         1111111111222222222233333333
                    [//  4567890123456789012345678901234567
                        'Hello\n' +                             // [0] 11  (6)
                        'World! This is a test\n' +             // [1] 12  (22)
                        'of multi-line blocks!\n',              // [2] 13  (22)
                                                                //---- = 50
                    //   11222222222233333333334444444444
                    //   89012345678901234567890123456789
                        'This is another block\n' +             // [3] 100 (22)
                        'with multiple lines.\n',               // [4] 101 (21)
                                                                //---- = 43
                    //   1111112222222222333333333344444
                    //   4567890123456789012345678901234
                        'This block has only one line.'         // [5] 200 (29)
                    ].join(''),
                    `0,11,4,${A}:1,100,18,${B}:2,200,14,${C}`);
            });

            describe('replace', function () {
                it('should split single-line chunks at the front', function () {
                    let src = this.src;
                    let chunks = src.chunks;

                    expect(chunks.length).to.be(3);

                    //   /##
                    //    # This block has only one line.
                    //      ^=-^
                    //    #/
                    src.replace(A + B, 4, 'While this');

                    expect(chunks.length).to.be(4); // one intra-line split

                    let lines = src.text.split('\n');
                    expect(lines[5]).to.be('While this block has only one line.');

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A}:` +
                        `1,100,18,${B}:` +
                        `2,200,14,${'While this'.length}:` +
                        `2,200,${14 + 4},${C - 4}`);
                });

                it('should split single-line chunks in the middle', function () {
                    let src = this.src;
                    let chunks = src.chunks;

                    expect(chunks.length).to.be(3);

                    //   /##
                    //    # This block has only one line.
                    //                          ^-^
                    //    #/
                    src.replace(A + B + 20, 3, 'a single');

                    expect(chunks.length).to.be(4); // one intra-line split

                    let lines = src.text.split('\n');
                    expect(lines[5]).to.be('This block has only a single line.');

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A}:` +
                        `1,100,18,${B}:` +
                        `2,200,14,${20 + 'a single'.length}:` +
                        `2,200,${14 + 20 + 3},${C - 20 - 3}`);
                });

                it('should split single-line chunks only if necessary', function () {
                    let src = this.src;
                    let chunks = src.chunks;

                    expect(chunks.length).to.be(3);

                    //   /##
                    //    # This block has only one line.
                    //                          ^-------^
                    //    #/
                    src.replace(A + B + C - 9, 9, 'a single line.');

                    expect(chunks.length).to.be(3); // no splits

                    let lines = src.text.split('\n');
                    expect(lines[5]).to.be('This block has only a single line.');

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A}:` +
                        `1,100,18,${B}:` +
                        `2,200,14,${C}`);
                });

                it('should split chunks above as necessary', function () {
                    let src = this.src;
                    let chunks = src.chunks;

                    expect(chunks.length).to.be(3);

                    //   /##
                    //    # This is another block
                    //    # with multiple lines.
                    //           ^------^
                    //    #/
                    src.replace(A + B0 + 5, 8, '2+');

                    expect(chunks.length).to.be(5); // 1 line split and 1 intra-line

                    let lines = src.text.split('\n');
                    expect(lines[4]).to.be('with 2+ lines.');

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A}:` +
                        `1,100,18,${B0}:` +
                        `1,101,18,${5 + '2+'.length}:` +
                        `1,101,${18 + 5 + 8},${B1 - 5 - 8}:` +
                        `2,200,14,${C}`);
                });

                it('should split chunks above but lines only if necessary', function () {
                    let src = this.src;
                    let chunks = src.chunks;

                    expect(chunks.length).to.be(3);

                    //   /##
                    //    # This is another block
                    //    # with multiple lines.
                    //                         ^
                    //    #/
                    src.replace(A + B - 2, 2, ' of text.\n');

                    expect(chunks.length).to.be(4); // 1 line split

                    let lines = src.text.split('\n');
                    expect(lines[4]).to.be('with multiple lines of text.');

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A}:` +
                        `1,100,18,${B0}:` +
                        `1,101,18,${B1 - 2 + ' of text.\n'.length}:` +
                        `2,200,14,${C}`);
                });

                it('should split chunks below as necessary', function () {
                    let src = this.src;
                    let chunks = src.chunks;

                    expect(chunks.length).to.be(3);

                    //   /##
                    //    # This is another block
                    //      ^--^
                    //    # with multiple lines.
                    //    #/
                    src.replace(A, 4, 'And this');

                    expect(chunks.length).to.be(5); // 1 line split and 1 intra-line

                    let lines = src.text.split('\n');
                    expect(lines[3]).to.be('And this is another block');

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A}:` +
                        `1,100,18,${'And this'.length}:` +
                        `1,100,${18 + 4},${B0 - 4}:` +
                        `1,101,18,${B1}:` +
                        `2,200,14,${C}`);
                });

                it('should not split chunks when unnecessary', function () {
                    let src = this.src;
                    let chunks = src.chunks;

                    expect(chunks.length).to.be(3);

                    //   /##
                    //    # This is another block
                    //      ^--^
                    //    # with multiple lines.
                    //    #/
                    src.replace(A, 4, 'Here');

                    expect(chunks.length).to.be(3);

                    let lines = src.text.split('\n');
                    expect(lines[3]).to.be('Here is another block');

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A}:` +
                        `1,100,18,${B}:` +
                        `2,200,14,${C}`);
                });

                it('should split chunks above and below as necessary', function () {
                    let src = this.src;
                    let chunks = src.chunks;

                    expect(chunks.length).to.be(3);

                    //   /##
                    //    # Hello
                    //    # World! This is a test
                    //             ^-----^
                    //    # of multi-line blocks!
                    //    #/
                    src.replace(A0 + 7, 7, 'Here goes');

                    expect(chunks.length).to.be(6); // 2 line splits and 1 intra-line

                    let lines = src.text.split('\n');
                    expect(lines[1]).to.be('World! Here goes a test');

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A0}:` +
                        `0,12,4,${7 + 'Here goes'.length}:` +
                        `0,12,${4 + 7 + 7},${A1 - 7 - 7}:` +
                        `0,13,4,${A2}:` +
                        `1,100,18,${B}:` +
                        `2,200,14,${C}`);
                });
            });

            describe('offsetToLineColumn', function () {
                it('should work for chunks[0] line 1', function () {
                    let lc, c = this.src.chunkFromOffset(0);

                    expect(c).to.be(this.src.chunks[0]);

                    lc = c.offsetToLineColumn(0);
                    expect(lc).to.equal([0,0]);

                    lc = c.offsetToLineColumn(3);
                    expect(lc).to.equal([0,3]);

                    lc = c.offsetToLineColumn(3);
                    expect(lc).to.equal([0,3]);

                    lc = c.offsetToLineColumn(A0 - 1);
                    expect(lc).to.equal([ 0, A0 - 1 ]);
                });

                it('should work for chunks[0] line 2', function () {
                    let lc, c = this.src.chunkFromOffset(0);

                    expect(c).to.be(this.src.chunks[0]);

                    lc = c.offsetToLineColumn(A0);
                    expect(lc).to.equal([1,0]);

                    lc = c.offsetToLineColumn(A0 + A1 - 1);
                    expect(lc).to.equal([1, A1 - 1]);
                });

                it('should work for chunks[0] line 3', function () {
                    let lc, c = this.src.chunkFromOffset(0);

                    expect(c).to.be(this.src.chunks[0]);

                    lc = c.offsetToLineColumn(A0 + A1);
                    expect(lc).to.equal([2, 0]);

                    lc = c.offsetToLineColumn(A0 + A1 + 10);
                    expect(lc).to.equal([2, 10]);

                    lc = c.offsetToLineColumn(A0 + A1 + A2 - 1);
                    expect(lc).to.equal([2, A2 - 1]);

                    lc = c.offsetToLineColumn(A);
                    expect(lc).to.be(null);
                });

                it('should work for chunks[1] line 1', function () {
                    let lc, c = this.src.chunkFromOffset(A);

                    expect(c).to.be(this.src.chunks[1]);

                    lc = c.offsetToLineColumn(A);
                    expect(lc).to.equal([0,0]);

                    lc = c.offsetToLineColumn(A + 11);
                    expect(lc).to.equal([ 0, 11 ]);

                    lc = c.offsetToLineColumn(A + B0 - 1);
                    expect(lc).to.equal([ 0, B0 - 1 ]);
                });

                it('should work for chunks[1] line 2', function () {
                    let lc, c = this.src.chunkFromOffset(A);

                    expect(c).to.be(this.src.chunks[1]);

                    lc = c.offsetToLineColumn(A + B0);
                    expect(lc).to.equal([1,0]);

                    lc = c.offsetToLineColumn(A + B0 + 11);
                    expect(lc).to.equal([ 1, 11 ]);

                    lc = c.offsetToLineColumn(A + B0 + B1 - 1);
                    expect(lc).to.equal([ 1, B1 - 1 ]);

                    lc = c.offsetToLineColumn(A + B);
                    expect(lc).to.be(null);
                });

                it('should work for chunks[2] line 1', function () {
                    let lc, c = this.src.chunkFromOffset(A + B);

                    expect(c).to.be(this.src.chunks[2]);
                    expect(this.src.chunks.length).to.be(3);

                    lc = c.offsetToLineColumn(A + B);
                    expect(lc).to.equal([0,0]);

                    lc = c.offsetToLineColumn(A + B + 11);
                    expect(lc).to.equal([ 0, 11 ]);

                    lc = c.offsetToLineColumn(A + B + C - 1);
                    expect(lc).to.equal([ 0, C - 1 ]);

                    lc = c.offsetToLineColumn(A + B + C);
                    expect(lc).to.be(null);
                });
            }); // offsetToLineColumn

            describe('splitChunkByLine', function () {
                it('should be able to split chunks[0] at line 1', function () {
                    let src = this.src;
                    let chunks = src.chunks;
                    let c = chunks[0];

                    expect(chunks.length).to.be(3);

                    let cn = src.splitChunkByLine(c, 1);  // keep 1 line

                    expect(chunks.length).to.be(4);

                    expect(chunks[0]).to.be(c);
                    expect(chunks[1]).to.be(cn);

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A0}:0,12,4,${A-A0}:1,100,18,${B}:2,200,14,${C}`);
                });

                it('should be able to split chunks[0] at line 2', function () {
                    let src = this.src;
                    let chunks = src.chunks;
                    let c = chunks[0];

                    expect(chunks.length).to.be(3);

                    let cn = src.splitChunkByLine(c, 2);  // keep 2 lines

                    expect(chunks.length).to.be(4);

                    expect(chunks[0]).to.be(c);
                    expect(chunks[1]).to.be(cn);

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A0+A1}:0,13,4,${A2}:1,100,18,${B}:2,200,14,${C}`);
                });

                it('should be able to split chunks[0] at 2 lines and 1 column', function () {
                    let src = this.src;
                    let chunks = src.chunks;
                    let c = chunks[0];
                    let c1 = chunks[1];
                    let c2 = chunks[2];

                    expect(chunks.length).to.be(3);

                    let cn = src.splitChunkByLine(c, 1);  // keep 1 line

                    expect(chunks.length).to.be(4);
                    expect(chunks).to.be.same([c, cn, c1, c2]);

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A0}:0,12,4,${A-A0}:1,100,18,${B}:2,200,14,${C}`);

                    let cn2 = src.splitChunkByLine(cn, 1);

                    expect(chunks.length).to.be(5);
                    expect(chunks).to.be.same([c, cn, cn2, c1, c2]);

                    s = src.toString();
                    expect(s).to.be(`0,11,4,${A0}:` +
                        `0,12,4,${A1}:` +
                        `0,13,4,${A2}:` +
                        `1,100,18,${B}:` +
                        `2,200,14,${C}`);

                    let cn3 = src.splitChunkIntraLine(cn, 10);

                    expect(chunks.length).to.be(6);
                    expect(chunks).to.be.same([c, cn, cn3, cn2, c1, c2]);

                    s = src.toString();
                    expect(s).to.be(`0,11,4,${A0}:` +
                        `0,12,4,10:` +
                        `0,12,14,${A1-10}:` +
                        `0,13,4,${A2}:` +
                        `1,100,18,${B}:` +
                        `2,200,14,${C}`);
                });

                it('should be able to split chunks[1] at line 1', function () {
                    let src = this.src;
                    let chunks = src.chunks;
                    let c0 = chunks[0];
                    let c = chunks[1];

                    expect(chunks.length).to.be(3);

                    let cn = src.splitChunkByLine(c, 1);  // keep 1 line

                    expect(chunks.length).to.be(4);

                    expect(chunks[0]).to.be(c0);
                    expect(chunks[1]).to.be(c);
                    expect(chunks[2]).to.be(cn);

                    let s = src.toString();
                    expect(s).to.be(`0,11,4,${A}:1,100,18,${B0}:1,101,18,${B1}:2,200,14,${C}`);
                });

                it('should fail on chunk[0] if line number is out of range', function () {
                    let src = this.src;
                    let chunks = src.chunks;
                    let c = chunks[0];

                    expect(chunks.length).to.be(3);

                    expect(() => {
                        let cn = src.splitChunkByLine(c, 3);  // keep 3 lines

                    }).to.exactly.throw(`Cannot split 3 line chunk after line 3`);

                    expect(chunks.length).to.be(3);
                });

                it('should fail on chunk[1] if line number is out of range', function () {
                    let src = this.src;
                    let chunks = src.chunks;
                    let c1 = chunks[1];

                    expect(chunks.length).to.be(3);

                    expect(() => {
                        let cn = src.splitChunkByLine(c1, 2);  // keep 2 lines

                    }).to.exactly.throw(`Cannot split 2 line chunk after line 2`);

                    expect(chunks.length).to.be(3);
                });

                it('should fail on chunk[2] if line number is out of range', function () {
                    let src = this.src;
                    let chunks = src.chunks;
                    let c = chunks[2];

                    expect(chunks.length).to.be(3);

                    expect(() => {
                        let cn = src.splitChunkByLine(c, 1);

                    }).to.exactly.throw(`Cannot split 1 line chunk by lines`);

                    expect(chunks.length).to.be(3);
                });
            }); // splitChunkByLine

            describe('splitChunkIntraLine', function () {
                it('should be able to split chunks[2]', function () {
                    let src = this.src;
                    let chunks = src.chunks;
                    let c0 = chunks[0];
                    let c1 = chunks[1];
                    let c = chunks[2];

                    expect(chunks.length).to.be(3);

                    let cn = src.splitChunkIntraLine(c, 10);  // at column offset 10

                    expect(chunks.length).to.be(4);

                    expect(chunks[0]).to.be(c0);
                    expect(chunks[1]).to.be(c1);
                    expect(chunks[2]).to.be(c);
                    expect(chunks[3]).to.be(cn);

                    let s = c.toString();
                    expect(s).to.be(`Zip.js,200,14,10`);

                    s = cn.toString();
                    expect(s).to.be(`Zip.js,200,24,${C-10}`);

                    s = src.toString();
                    expect(s).to.be(`0,11,4,${A}:1,100,18,${B}:2,200,14,10:2,200,24,${C-10}`);
                });

                it('should fail on multi-line chunks[0]', function () {
                    let src = this.src;
                    let chunks = src.chunks;
                    let c = chunks[0];

                    expect(chunks.length).to.be(3);

                    expect(() => {
                        let cn = src.splitChunkIntraLine(c, 3);

                    }).to.exactly.throw(`Cannot do intra-line split on multi-line chunks`);

                    expect(chunks.length).to.be(3);
                });

                it('should fail on multi-line chunks[1]', function () {
                    let src = this.src;
                    let chunks = src.chunks;
                    let c = chunks[1];

                    expect(chunks.length).to.be(3);

                    expect(() => {
                        let cn = src.splitChunkIntraLine(c, 3);

                    }).to.exactly.throw(`Cannot do intra-line split on multi-line chunks`);

                    expect(chunks.length).to.be(3);
                });
            }); // splitChunkIntraLine
        }); // split and replace
    }); // Sources
});
