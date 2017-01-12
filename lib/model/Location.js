'use strict';

const File = require('phylo');

const Base = require('../Base');

class Location extends Base {
    static from (src, resolver) {
        if (!src || src === '??') {
            return null;
        }

        if (src.isLocation) {
            if (src.constructor === this) {
                return src;
            }

            return new this(src);
        }
        
        let parts = src.split(this.separator),
            i = parts.length;

        while (--i > 0) {
            parts[i] = +parts[i];
        }

        if (resolver) {
            parts[0] = resolver(parts[0]);
        }

        return new this(...parts);
    }
    
    static format (file, line, column) {
        if (file && file.isLocation) {
            return this.format(file.file, file.line, file.column);
        }

        let ret = File.path(file) || '?';
        
        if (line > 0) {
            ret += this.separator;
            ret += line;
            
            if (column > 0) {
                ret += this.separator;
                ret += column;
            }
        }
        
        return ret;
    }

    static join (...locations) {
        return this.joinAll(locations);
    }

    static joinAll (locations, resolver) {
        let ret = '';

        for (let loc of locations) {
            if (ret) {
                ret += this.delimiter;
            }

            if (loc) {
                let file = resolver ? String(resolver(loc.file)) : loc.file;

                ret += this.format(file, loc.line, loc.column);
            }
            else {
                ret += '??';
            }
        }

        return ret;
    }

    static split (src, resolver) {
        let locations = src.split(this.delimiter);

        for (let i = locations.length; i-- > 0; ) {
            locations[i] = this.from(locations[i], resolver);
        }

        return locations;
    }

    constructor (file, line, column) {
        super();

        this.change(file, line, column);
    }

    advance (numLines) {
        if (this.line > 0) {
            this.line += (numLines == null) ? 1 : numLines;
        }
        return this;
    }
    
    advanceColumn (numColumns) {
        if (this.column > 0) {
            this.column += (numColumns == null) ? 1 : numColumns;
        }
        return this;
    }

    at (offset) {
        let me = this,
            C = me.constructor,
            cursor = me._cursor || (me._cursor = new C());

        cursor.file = me.file;
        cursor.line = me.line;
        cursor.column = me.column + offset;

        return cursor;
    }

    change (file, line, column) {
        let me = this;

        if (file && file.isLocation) {
            return me.change(file.file, file.line, file.column);
        }

        if (typeof file === 'number') { // passed 2 args (assume it was line & column)
            column = line;
            line = file;
        }
        else if (file === '?') {
            me.file = null;
        }
        else {
            me.file = File.from(file);
        }

        if (line > 0) {
            me.line = line;
        }

        if (column > 0) {
            me.column = column;
        }

        return me;
    }

    clone () {
        return new this.constructor(this);
    }

    generate (values) {
        let ret = [];
        let offset = 0;
        let C = this.constructor;

        for (let v of values) {
            ret.push(new C(this).advanceColumn(offset));
            offset += v.length + 1;  // +1 for separator
        }

        return ret;
    }

    lineCount (from) {
        if (from.isLocation) {
            from = from.line;
        }

        let line = this.line;
        let count = line - from;

        if (count < 0) {
            count = -count;
        }

        return (line < 1 || from < 1)  ? -1 : count;
    }

    toString () {
        return this.constructor.format(this);
    }
}

Location.define({
    isLocation: true,

    file: null,
    line: -1,
    column: -1,

    static: {
        // The character used to delimit concatenated locations (such as
        // 'Foo.js:123:20|Bar.js:343:10'):
        delimiter: '|',

        // The character used to separate the components of a stringified
        // location (e.g., 'Foo.js:123:20'). This format is most commonly
        // understood by log parsers (e.g., IDE's).
        separator: ':'
    }
});

module.exports = Location;
