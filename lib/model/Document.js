'use strict';

const Node = require('./Node');
const Util = require('./util');

class Document extends Node {
    static create () {
        let doc = new this();

        doc.init();

        return doc;
    }

    constructor () {
        super();

        this._ownerDocument = this;
        this._customElements = new Util.Empty();
        this._registeredElements = new Util.Empty();
    }

    init () {
        //
    }

    registerElement (C) {
        this._customElements[C.tagName] = C;
        this._registeredElements[C.tagName] = C;
    }
}

Document.define({
    isDocument: true,
    tagName: 'doxi',

    baseDir: null,

    static: {
    }
});

module.exports = Document;
