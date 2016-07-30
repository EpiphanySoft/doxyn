"use strict";

class Location {
    constructor (file, line, column) {
        this.change(file, line, column);
    }

    static from (src) {
        if (src.isLocation) {
            return src;
        }
        
        var parts = src.split(':');
        
        return new this(parts[0], +parts[1], +parts[2]);
    }
    
    static format (file, line, column) {
        if (file.isLocation) {
            return Location.format(file.file, file.line, file.column);
        }

        var ret = file;
        
        if (line > 0) {
            ret += ':';
            ret += line;
            
            if (column > 0) {
                ret += ':';
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
        var me = this;

        if (file.isLocation) {
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

        var line = this.line;
        var count = line - from;

        if (count < 0) {
            count = -count;
        }

        return (line < 1 || from < 1)  ? -1 : count;
    }

    toString () {
        return this.constructor.format(this);
    }
}

Object.assign(Location.prototype, {
    isLocation: true,

    file: null,
    line: -1,
    column: -1
});

module.exports = Location;
