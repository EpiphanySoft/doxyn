'use strict';

const Base = require('../Base');

class Location extends Base {
    constructor (file, line, column) {
        super();

        this.change(file, line, column);
    }

    static from (src) {
        if (src.isLocation) {
            if (src.constructor === this) {
                return src;
            }

            return new this(src);
        }
        
        let parts = src.split(this.separator),
            i = parts.length;

        for (; i-- > 1; ) {
            parts[i] = +parts[i];
        }
        
        return new this(...parts);
    }
    
    static format (file, line, column) {
        if (file.isLocation) {
            return this.format(file.file, file.line, file.column);
        }

        let ret = file;
        
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
    
    advance (numLines) {
        if (this.line > 0) {
            this.line += numLines || 1;
        }
        return this;
    }
    
    advanceColumn (numColumns) {
        if (this.column > 0) {
            this.column += numColumns || 1;
        }
        return this;
    }
    
    change (file, line, column) {
        let me = this;

        if (file && file.isLocation) {
            return me.change(file.file, file.line, file.column);
        }

        if (typeof file === 'number') {
            column = line;
            line = file;
        }
        else if (file) {
            me.file = file;
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
        separator: ':'
    }
});

module.exports = Location;
