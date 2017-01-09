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
        let s, id, ret = '';

        for (let location of locations) {
            if (!location || !location.file) {
                // Encode null as something we can restore if parsed (to preserve
                // the null at a particular index).
                s = '??';
            }
            else {
                id = this.getFileId(location.file);

                s = `${id}${sep}${location.line}${sep}${location.column}`;
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

        if (f && f.isAbsolute()) { // assume relative paths are relative to baseDir
            f = f.relativize(this._baseDir);
        }

        return f && f.slashify();
    }

    fixupLocation (loc) {
        loc.file = this.getFile(loc.file);
        return loc;
    }

    /**
     * This method returns the `File` for a specified `id` in this document's files
     * collection or from another `File` or path. In the second case, if the file is not
     * represented in the files collection, it is added.
     * @param {File/Number} fileOrId
     * @return {File}
     */
    getFile (fileOrId) {
        if (typeof fileOrId === 'number') {
            return this._files[fileOrId] || null;
        }

        let f = this.fileFromPath(fileOrId);
        let i = this._filesMap[f.path];

        if (i != null) {
            return this._files[i];
        }

        this._filesMap[f.path] = i = this._files.length;
        this._files.push(f);

        f.fileId = i;
        return f;
    }

    /**
     * This method returns the `id` in files collection for the given `File` or path,
     * adding the file if necessary.
     * @param {String/File} path
     * @return {Number}
     */
    getFileId (path) {
        let f = this.getFile(path);

        return f.fileId;
    }

    resolveFile (pathOrId) {
        let f = (typeof pathOrId === 'number') ? this.getFile(pathOrId) : File.from(pathOrId);

        f = f && f.isRelative() && this._baseDir.resolve(f);

        return f;
    }

    resolveLocation (loc, clone) {
        if (loc) {
            if (clone) {
                loc = loc.clone();
            }

            loc.file = this.resolveFile(loc.file);
        }

        return loc;
    }

    //--------------------------------------------------------------------------
    // Elements

    registerElement (C) {
        this._customElements[C.tagName] = C;
        this._registeredElements[C.tagName] = C;
    }
}

Document.define({
    isDocument: true,
    tagName: 'doxi',
    version: 1,

    _baseDir: File.cwd(),

    static: {
    }
});

module.exports = Document;
