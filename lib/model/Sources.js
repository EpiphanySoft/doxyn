"use strict";

const Location = require('./Location.js');

//                                            1    1   1   1   1    1
//   0   1   2   3   4    5   6   7   8   9   0    1   2   3   4    5
// +---+---+---+---+---+----+---+---+---+---+---+----+---+---+---+----+
// | H | e | l | l | o | \n | w | o | r | l | d | \n | Y | o | ! | \n |
// +---+---+---+---+---+----+---+---+---+---+---+----+---+---+---+----+
//
//     0:  Hello
//     1:  world
//     2:  Yo!
//

class Chunk extends Location {
    constructor (file, line, column, length) {
        super(file, line, column);
        
        if (length > 0) {
            this.length = length;
        }

        this.file = +this.file;  // file starts as an index
    }

    static fieldOf (chunk, index) {
        let begin = 0;
        let end = chunk.indexOf(',');
        let i, s;

        for (i = 0; i < index && end > -1; ++i) {
            begin = end + 1;
            end = chunk.indexOf(',', begin);
        }

        if (i < index) { // not done yet, but we ran out of fields...
            return -1;
        }

        s = chunk.substring(begin, (end < 0) ? chunk.length : end);
        return +s;
    }

    static format (file, line, column, length) {
        let ret = super.format(file, line, column);

        if (file.isSrcChunk) {
            length = file.length;
        }

        if (length > 0) {
            ret += this.separator;
            ret += length;
        }

        return ret;
    }

    init (owner, pos) {
        let me = this,
            length = me.length,
            files = owner.files;

        if (files) {
            me.file = files[me.file];
        }

        me.owner = owner;
        me.begin = pos;

        return me;
    }

    get end () {
        let end = this.begin,
            length = this.length;

        if (length > 0) {
            end += length;
        }

        return end;
    }

    get text () {
        let me = this,
            text = me._text;

        if (!text) {
            me._text = text = me.owner.text.substr(me.begin, me.length);
        }

        return text;
    }

    scan (cursor, offset) {
        let me = this;
        let index = offset;
        let col = 0;
        let line = 0;
        let text = me.owner.text;
        let end, i, next;
        
        if (!me.spans(offset)) {
            return false;
        }
        
        cursor.change(me);  // copy our location into the cursor

        for (i = me.begin, end = me.end; i < end; i = next) {
            next = text.indexOf('\n', i);
            next = (next < 0) ? end : (next + 1);

            if (i <= index && index < next) {
                col = index - i;
                break;
            }

            ++line;
        }

        cursor.advance(line);
        cursor.advanceColumn(col);

        return true;
    }
    
    spans (offset, length) {
        let begin = this.begin,
            len = this.length,
            n = offset + (length ? length - 1 : 0);
        
        if (begin <= offset) {
            n -= begin;
            if (n < len) {
                return true;
            }
        }

        return false;
    }

    toSrc () {
        let me = this,
            owner = me.owner,
            line = me.line,
            col = me.column,
            len = me.length,
            src = me.file;

        if (owner && owner.files && typeof src === 'string') {
            src = owner.files.indexOf(src);
        }

        if (line > 0) {
            src += ',';
            src += line;

            if (col > 0) {
                src += ',';
                src += col;

                if (len > 0) {
                    src += ',';
                    src += len;
                }
            }
        }

        return src;
    }
}

Chunk.separator = ',';

Object.assign(Chunk.prototype, {
    isSrcChunk: true,

    begin: -1,
    length: -1,

    _text: null
});

//----------------------------------------------------------------------------

/**
 * This class manages a "sources" to describe the location of the text. The string
 * looks like this:
 *
 *      text = "Foo\n\nSome stuff\n";
 *
 *      src = "0,1,1,2:0,2,4,1";
 *
 * The map is a series of colon delimited 4-tuples consisting of these parts:
 *
 *                     File
 *                     | Line
 *                     | | Column
 *                     | | | Count
 *                     | | | |
 *                     v v v v
 *            "0,1,1,2:0,2,4,1"
 *             ^ ^ ^ ^
 *             | | | |
 *      File --+ | | |
 *      Line ----+ | |
 *      Column ----+ |
 *      Count -------+
 *
 * The "file" field is an index into the files array.
 */
class Sources {
    constructor (files, text, src) {
        this.files = files;
        this.text = text;
        this.src = src;
    }

    get chunks () {
        let me = this,
            chunks = me._chunks,
            chunk, part, pos, src;
        
        if (!chunks) {
            me._chunks = chunks = [];
            src = me.src;
            
            if (src) {
                src = src.split(':');
                
                pos = 0;
                
                for (part of src) {
                    chunks.push(chunk = Chunk.from(part));
                    chunk.init(me, pos);
                    pos = chunk.end;
                }
            }
        }
        
        return chunks;
    }

    at (offset) {
        let me = this,
            cursor = me._cursor || (me._cursor = new Location()),
            chunk, chunks;

        if (cursor._offset !== offset) {
            chunks = me.chunks;

            for (chunk of chunks) {
                if (chunk.scan(cursor, offset)) {
                    cursor._offset = offset;
                    return cursor;
                }
            }
        }

        return null;
    }

    chunkIndexFromOffset (offset) {
        let chunks = this.chunks,
            index = 0,
            pos = 0,
            chunk;

        if (offset >= 0) {
            for (chunk of chunks) {
                pos += chunk.length;

                if (offset < pos) {
                    return index;
                }

                ++index;
            }
        }

        return -1;
    }

    chunkFromOffset (offset) {
        let index = this.chunkIndexFromOffset(offset);

        return (index < 0) ? null : this.chunks[index];
    }

    /**
     * The act of replacing text with other text (say to expand and fully qualify a link),
     * takes several steps. Let's start with a simple case:
     *
     *               1    1    2    2    3    3    4    4    5    5    6    6
     *         456789012345678901234567890123456789012345678901234567890123456789
     *      41 /##
     *      42  # This is some text and a {#link foo} and another {#link bar}
     *      43  # and there a second line of text and another {#link goo}.
     *      44  #/
     *
     * The "src" for the above might be something simple like: "0,42,7,118". The "text"
     * would have 60 characters from line 42, a new line (\n) and 57 characters from line
     * 43.
     *
     * To change "{#link foo}" to "{#link foo.html}" and still preserve the location of
     * the text that follows, the "src" would have to be split into this:
     *
     *      0,42,7,36:0,42,42,25:0,43,7,57
     *
     * Now that line 42 is split into 2 chunks, changes to the first chunk will create an
     * overlap or gap. The content of this overlap/gap area is, however, assumed to be
     * auto generated and so unlikely to need proper location information. Given this
     * approach it is still possible to produce the correct location for the second link
     * on line 42 as well as the link on line 43.
     *
     * @param {Number} offset
     * @param {Number} length
     * @param {String} str
     */
    replace (offset, length, str) {
        //TODO
    }

    toString () {
        let me = this,
            src = me.src,
            chunk, chunks;

        if (!src) {
            src = '';
            chunks = me.chunks;
            
            for (chunk of chunks) {
                if (src) {
                    src += ':';
                }
                
                src += chunk.toSrc();
            }
            
            me.src = src;
        }

        return src;
    }
}

Sources.Chunk = Chunk;

Object.assign(Sources.prototype, {
    isSources: true,

    _cursor: null
});

module.exports = Sources;
