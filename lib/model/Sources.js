"use strict";

const Location = require('doxyn/lib/model/Location');

class Chunk extends Location {
    constructor (file, line, column, length) {
        super(file, line, column);
        
        if (length > 0) {
            this.length = length;
        }
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

    init (files, pos) {
        var me = this,
            file = +me.file;

        if (files) {
            file = files[file];
        }

        me.begin = pos;
        me.end = pos + me.length;
        me.file = file;
    }
}

Chunk.separator = ',';

Object.assign(Chunk.prototype, {
    isSrcChunk: true,

    begin: -1,
    end: -1,
    length: -1
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

    static from (src) {
        if (src.isLocation) {
            return src;
        }
        
        var parts = src.split(':');
        
        return new this(parts[0], +parts[1], +parts[2]);
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
                    chunk.init(me.files, pos);
                    pos = chunk.end;
                }
            }
        }
        
        return chunks;
    }

    toString () {
        return this.constructor.format(this);
    }
}

Sources.Chunk = Chunk;

Object.assign(Sources.prototype, {
    isSources: true
});

module.exports = Sources;
