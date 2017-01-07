'use strict';

const File = require('phylo');

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

    /**
     * This method accepts a `File` or path and returns a `File` that is relative to this
     * documents `baseDir`.
     * @param {String/File} path
     * @return {File}
     */
    fileFromPath (path) {
        let f = File.from(path).absolutify();
        return f.relativize(this._baseDir).slashify();
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

    _baseDir: null,

    static: {
    }
});

module.exports = Document;
