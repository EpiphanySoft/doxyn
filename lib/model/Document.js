'use strict';

const File = require('phylo');

const Location = require('./Location');
const Node = require('./Node');
const Util = require('../util');

class Document extends Node {
    static create () {
        let doc = new this();

        doc.init();

        return doc;
    }

    constructor () {
        super();

        this._files = [];
        this._filesMap = new Util.Empty();

        this._ownerDocument = this;
        this._customElements = new Util.Empty();
        this._registeredElements = new Util.Empty();
    }

    init () {
        //
    }

    //---------------------------------------------------------------------
    // Properties

    get baseDir () {
        return this._baseDir;
    }

    set baseDir (value) {
        let was = this._baseDir;
        let files = this._files;
        let n = files.length;

        this._baseDir = File.from(value).absolutify();

        if (n) {
            this._filesMap = new Util.Empty();

            for (let i = 0; i < n; ++i) {
                let f = files[i];

                if (was) {
                    f = was.resolve(f);
                }

                f = f.relativize(this._baseDir).slashify();

                files[i] = f;
                this._filesMap[f.path] = i;
            }
        }
    }

    get files () {
        return this._files;
    }

    //---------------------------------------------------------------------
    // Methods

    encodeLocation (...locations) {
        let sep = Location.separator;
        let del = Location.delimiter;
        let s, index, ret = '';

        for (let location of locations) {
            if (!location || !location.file) {
                // Encode null as something we can restore if parsed (to preserve
                // the null at a particular index).
                s = '??';
            }
            else {
                index = this.getFileIndex(location.file);

                s = `${index}${sep}${location.line}${sep}${location.column}`;
            }

            if (ret) {
                ret += del;
            }

            ret += s;
        }

        return ret;
    }

    /**
     * This method accepts a `File` or path and returns a `File` that is relative to this
     * documents `baseDir`.
     * @param {String/File} path
     * @return {File}
     * @private
     */
    fileFromPath (path) {
        let f = File.from(path);
        let baseDir = this._baseDir;

        if (f && baseDir && f.isAbsolute()) { // assume relative paths are relative to baseDir
            f = f.relativize(baseDir);
        }

        return f && f.slashify();
    }

    fixupLocation (location) {
        let loc = location.clone();

        loc.file = this.fileFromPath(loc.file);

        return loc;
    }

    /**
     * This method returns the `File` for a specified `index` in this document's files
     * collection.
     * @param {Number} index
     * @return {File}
     */
    getAbsoluteFile (index) {
        let f = this._files[index] || null;
        let b = this._baseDir;

        if (f && b) {
            f = b.resolve(f);
        }

        return f;
    }

    /**
     * This method returns the `File` for a specified `index` in this document's files
     * collection.
     * @param {Number} index
     * @return {File}
     */
    getFile (index) {
        return this._files[index] || null;
    }

    /**
     * This method returns the index in files collection for the given `File` or path,
     * adding the file if necessary.
     * @param {String/File} path
     * @return {Number}
     */
    getFileIndex (path) {
        let f = this.fileFromPath(path);
        let i = this._filesMap[f.path];

        if (i == null) {
            this._filesMap[f.path] = i = this._files.length;
            this._files.push(f);
        }

        return i;
    }

    registerElement (C) {
        this._customElements[C.tagName] = C;
        this._registeredElements[C.tagName] = C;
    }
}

Document.define({
    isDocument: true,
    tagName: 'doxi',
    version: 1,

    _baseDir: null,

    static: {
    }
});

module.exports = Document;
