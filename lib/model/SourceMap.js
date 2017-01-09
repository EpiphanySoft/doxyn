'use strict';

const File = require('phylo');

const Base = require('../Base');
const Location = require('./Location');

/**
 * A chunk represents a particular "bounding box" of multi-line text. The idea being
 * that all lines have the same left-most column.
 */
class Chunk extends Base {
    static fieldOf (chunk, index) {
        let sep = this.separator;
        let begin = 0;
        let end = chunk.indexOf(sep);
        let i, s;

        for (i = 0; i < index && end > -1; ++i) {
            begin = end + 1;
            end = chunk.indexOf(sep, begin);
        }

        if (i < index) { // not done yet, but we ran out of fields...
            return -1;
        }

        s = chunk.substring(begin, (end < 0) ? chunk.length : end);
        return +s;
    }

    static from (src) {
        if (src.isSrcChunk) {
            if (src.constructor === this) {
                return src;
            }

            return new this(src);
        }

        let parts = src.split(this.separator),
            i = parts.length;

        while (i-- > 0) {
            parts[i] = +parts[i];
        }

        return new this(...parts);
    }

    constructor (fileId, line, column, length) {
        super();

        if (fileId.isSrcChunk) {
            this.fileId = fileId.fileId;
            this.line = fileId.line;
            this.column = fileId.column;
            this.begin = fileId.begin;
            this.length = fileId.length;
            this.owner = fileId.owner;
        }
        else {
            this.fileId = +fileId;
            this.line = line;
            this.column = column;

            if (length > 0) {
                this.length = length;
            }
        }
    }

    init (owner, pos) {
        let me = this;

        me.owner = owner;
        me.begin = pos;

        return me;
    }

    //---------------------------------------------------------------
    // Properties

    get end () {
        let end = this.begin,
            length = this.length;

        if (length > 0) {
            end += length;
        }

        return end;
    }

    get file () {
        let owner = this.owner;
        let files = owner && owner.files;

        return files && files[this.fileId] || null;
    }

    get text () {
        let me = this,
            text = me._text;

        if (!text) {
            me._text = text = me.owner.text.substr(me.begin, me.length);
        }

        return text;
    }

    //---------------------------------------------------------------
    // Methods

    clone () {
        return new this.constructor(this);
    }

    lineCount () {
        let me = this,
            text = me.owner.text,
            count = 0;

        for (let next, i = me.begin, end = me.end; i < end; i = next + 1) {
            ++count;

            next = text.indexOf('\n', i);

            if (next < 0) {
                break;
            }
        }

        return count;
    }

    lineLength (lineNum) {
        let me = this,
            text = me.owner.text,
            num = 0;

        for (let next, i = me.begin, end = me.end; i < end; ++num, i = next) {
            next = text.indexOf('\n', i);
            next = (next < 0) ? end : Math.min(end, next + 1);

            if (num === lineNum) {
                return next - i;
            }
        }

        return -1;
    }

    /**
     * Returns the line offset and column offset as a 2-element array given a character
     * `offset`. If the `offset` is beyond this chunk then `null` is returned.
     * @param {Number} offset The character offset.
     * @return {Number[]}
     */
    offsetToLineColumn (offset) {
        let me = this;
        let index = offset;
        let line = 0;
        let text = me.owner.text;
        let end, i, next;

        if (me.spans(offset)) {
            for (i = me.begin, end = me.end; i < end; i = next) {
                next = text.indexOf('\n', i);
                next = (next < 0) ? end : (next + 1);

                if (i <= index && index < next) {
                    return [ line, index - i ];
                }

                ++line;
            }
        }

        return null;
    }

    scan (offset, cursor) {
        let coords = this.offsetToLineColumn(offset);

        if (!coords) {
            return false;
        }

        cursor.change(this.file, this.line, this.column);
        cursor.advance(coords[0]);
        cursor.advanceColumn(coords[1]);

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

    toSrc (file) {
        let sep = this.constructor.separator;
        let line = this.line;
        let col = this.column;
        let len = this.length;
        let s = file || this.fileId;

        if (line > 0) {
            s += sep;
            s += line;

            if (col > 0) {
                s += sep;
                s += col;

                if (len > 0) {
                    s += sep;
                    s += len;
                }
            }
        }

        return s;
    }

    toString () {
        let s = File.path(this.file);
        return this.toSrc(s);
    }
}

Chunk.define({
    isSrcChunk: true,

    begin: -1,
    length: -1,

    _text: null,

    static: {
        delimiter: '|',
        separator: ':'
    }
});

//----------------------------------------------------------------------------

/**
 * This class manages the description of the location of multi-line text. The data
 * looks like this:
 *
 *      text = "Foo\n\nSome stuff\n";
 *
 *      src = "0:1:1:5|0:2:4:11";
 *
 * The src is a series of colon delimited 4-tuples consisting of these Chunks:
 *
 *                     File
 *                     | Line
 *                     | | Column
 *                     | | | Count
 *                     | | | |
 *                     v v v v
 *            "0:1:1:5|0:2:4:11"
 *             ^ ^ ^ ^
 *             | | | |
 *      File --+ | | |
 *      Line ----+ | |
 *      Column ----+ |
 *      Count -------+
 *
 * The "file" field is an index into the files array.
 */
class SourceMap extends Base {
    constructor (files, text, src) {
        super();

        this.files = files;
        this.text = text;
        this.src = src;
    }

    get chunks () {
        let me = this,
            chunks = me._chunks,
            chunk, pos, src;
        
        if (!chunks) {
            me._chunks = chunks = [];
            src = me.src;
            
            if (src) {
                src = src.split(Chunk.delimiter);
                
                pos = 0;
                
                for (let part of src) {
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
            chunks;

        if (cursor._offset !== offset) {
            chunks = me.chunks;

            for (let chunk of chunks) {
                if (chunk.scan(offset, cursor)) {
                    cursor._offset = offset;
                    return cursor;
                }
            }

            return null;
        }

        return cursor;
    }

    attach (files, mapper) {
        for (let chunk of this.chunks) {
            chunk.fileId = mapper(this.files[chunk.fileId]);
        }

        this.files = files;
    }

    chunkIndexFromOffset (offset) {
        let chunks = this.chunks,
            index = 0,
            pos = 0;

        if (offset >= 0) {
            for (let chunk of chunks) {
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

    detach (baseDir) {
        let chunks = this.chunks;
        let files = [];
        let map = {};

        for (let chunk of chunks) {
            let id = chunk.fileId;
            let newId = map[id];

            if (newId === undefined) {
                map[id] = newId = files.length;
                files.push(baseDir.resolve(this.files[id]));
            }

            chunk.fileId = newId;
        }

        this.files = files;
    }

    /**
     * The act of replacing text with other text (say to expand and fully qualify a link),
     * takes several steps. Let's start with a simple case:
     *
     *               1    1    2    2    3    3    4    4    5    5    6    6
     *         456789012345678901234567890123456789012345678901234567890123456789
     *      41 /##
     *      42  # This is some text and a {#link foo} and another {#link bar} and
     *      43  # there a second line of text and another {#link goo}.
     *      44  #/
     *
     * The "src" for the above might be something simple like: "0:42:7:118". The "text"
     * would have 60 characters from line 42, a new line (\n) and 57 characters from line
     * 43.
     *
     * To change "{#link foo}" to "{#link foo.html}" and still preserve the location of
     * the text that follows, the "src" would have to be split into this:
     *
     *               1    1    2    2    3    3    4    4    5    5    6    6
     *         456789012345678901234567890123456789012345678901234567890123456789
     *      41 /##
     *      42  # This is some text and a {#link foo.html}
     *      42  #                                     and another {#link bar} and
     *      43  # there a second line of text and another {#link goo}.
     *      44  #/
     *
     *      0:42:7:40 | 0:42:42:34 | 0:43:7:52
     *
     * Now that line 42 is split into 2 chunks, changes to the first chunk will create an
     * overlap or gap. The content of this overlap/gap area is, however, assumed to be
     * auto generated and so unlikely to need proper location information. Given this
     * approach it is still possible to produce the correct location for the second link
     * on line 42 as well as the link on line 43.
     *
     * After replacing "{#link bar}" with "{#link bar.html}" the chunks will look like
     * this:
     *
     *               1    1    2    2    3    3    4    4    5    5    6    6
     *         456789012345678901234567890123456789012345678901234567890123456789
     *      41 /##
     *      42  # This is some text and a {#link foo.html}
     *      42  #                                     and another {#link bar.html}
     *      42  #                                                             and
     *      43  # there a second line of text and another {#link goo}.
     *      44  #/
     *
     *      0:42:7:40 | 0:42:42:29 | 0:42:66:5| 0:43:7:52
     *
     * @param {Number} offset
     * @param {Number} length
     * @param {String} str
     */
    replace (offset, length, str) {
        if (length !== str.length) {
            let chunk = this.chunkFromOffset(offset);
            let count = chunk.lineCount();

            if (count > 1) {
                let line = chunk.offsetToLineColumn(offset)[0];

                if (line) {
                    chunk = this.splitChunkByLine(chunk, line);
                }

                if (chunk.lineCount() > 1) {
                    this.splitChunkByLine(chunk, 1);
                }
            }

            // we limit support for replacement to all in a single line of one chunk
            if (!chunk || !chunk.spans(offset, length)) {
                throw new Error(`Invalid replacement range`);
            }

            let col = chunk.offsetToLineColumn(offset)[1];

            if (col + length < chunk.length) {
                // if there is text after the replacement range, that text is not
                // "moving" so we need to split the chunk there...
                this.splitChunkIntraLine(chunk, col + length);
            }

            chunk.length += str.length - length;
        }

        let text = this.text;

        this.text = text.substr(0, offset) + str + text.substr(offset + length);

        this.onChangeText(this.text);
    }

    splitChunkAt (chunk, charIndex) {
        let chunks = this.chunks;
        let next = chunk.clone();
        let index = chunks.indexOf(chunk);

        chunks.splice(index + 1, 0, next);

        chunk.length = charIndex;

        next.length -= charIndex;
        next.begin += charIndex;

        this.src = null;  // needs to be rebuilt

        return next;
    }

    splitChunkByLine (chunk, numLines) {
        let length = chunk.lineCount();

        if (numLines < 1) {
            throw new Error(`Invalid line split value (${numLines})`);
        }
        if (length === 1) {
            throw new Error(`Cannot split ${length} line chunk by lines`);
        }
        if (length <= numLines) {
            throw new Error(`Cannot split ${length} line chunk after line ${numLines}`);
        }

        length = 0;

        for (let i = 0; i < numLines; ++i) {
            length += chunk.lineLength(i);
        }

        let next = this.splitChunkAt(chunk, length);

        next.line += numLines;

        return next;
    }

    splitChunkIntraLine (chunk, columnOffset) {
        if (chunk.lineCount() > 1) {
            throw new Error('Cannot do intra-line split on multi-line chunks');
        }

        let next = this.splitChunkAt(chunk, columnOffset);

        next.column += columnOffset;

        return next;
    }

    toString () {
        let me = this,
            src = me.src,
            chunks;

        if (!src) {
            src = '';
            chunks = me.chunks;
            
            for (let chunk of chunks) {
                if (src) {
                    src += Chunk.delimiter;
                }
                
                src += chunk.toSrc();
            }
            
            me.src = src;
        }

        return src;
    }

    onChangeText (text) {
        // template method for user to replace
    }
}

SourceMap.define({
    isSourceMap: true,

    _chunks: null,
    _cursor: null,

    static: {
        Chunk: Chunk
    }
});

module.exports = SourceMap;
