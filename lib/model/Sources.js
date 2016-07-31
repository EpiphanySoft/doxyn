"use strict";

const Location = require('./Location.js');

class Chunk extends Location {
    constructor (file, line, column, length) {
        super(file, line, column);
        
        if (length > 0) {
            this.length = length;
        }

        this.file = +this.file;  // file starts as an index
    }

    static fieldOf (chunk, index) {
        var begin = 0;
        var end = chunk.indexOf(',');
        var i, s;

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
        var ret = super.format(file, line, column);

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
        var me = this,
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
        var end = this.begin,
            length = this.length;

        if (length > 0) {
            end += length;
        }

        return end;
    }

    get text () {
        var me = this,
            text = me._text;

        if (!text) {
            me._text = text = me.owner.text.substr(me.begin, me.length);
        }

        return text;
    }

    toSrc () {
        var me = this,
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
        var me = this,
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

    chunkIndexFromOffset (offset) {
        var chunks = this.chunks,
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
        var index = this.chunkIndexFromOffset(offset);

        return (index < 0) ? null : this.chunks[index];
    }

    erase (offset, length) {
        var me = this,
            chunks = me.chunks,
            index = me.chunkIndexFromOffset(offset),
            text = me.text,
            chunk, k, n, prev;

        if (index >= 0) {
            n = chunks[chunks.length - 1].end;
            length = Math.min(offset + length, n) - offset;

            if (text) {
                me.text = text.substr(0, offset) + text.substr(offset + length);
            }

            chunk = chunks[index];
            n = chunk.end - offset;  // the most we can erase from this chunk
            n = Math.min(n, length);

            if (!(chunk.length -= n)) {
                // remove the whole chunk...
                chunks.splice(index, 1);
                prev = index ? chunks[index - 1] : null;
            } else {
                ++index;
                prev = chunk;
            }

            for (length -= n; index < chunks.length; ++index) {
                chunk = chunks[index];
                chunk.begin = prev ? prev.end : 0;
                n = Math.min(length, k = chunk.length);

                if (n < k) {
                    // remove the first n characters but there are left-overs
                    chunk.length -= n;
                    prev = chunk;
                } else {
                    // the whole chunk is being erased
                    chunks.splice(index, 1);
                    --index;
                }

                length -= n;
            }
            
            me.src = null;
        }
    }

    toString () {
        var me = this,
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
    isSources: true
});

module.exports = Sources;
