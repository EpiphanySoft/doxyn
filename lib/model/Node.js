"use strict";

const EMPTY = [];

Object.freeze(EMPTY);

var idSeed = 0;

class Node {
    constructor () {
        var me = this;
    }
    
    //-----------------------------------------------------------
    // Properties

    get childNodes () {
        return this._childNodes;
    }
    
    get id () {
        return this._id;
    }
    
    set id (v) {
        this._id = v ? v : ++idSeed;
    }
    
    //-----------------------------------------------------------
    // Methods
    
    child (tagName) {
        //
    }

    //-----------------------------------------------------------
    // Attributes API


    //-----------------------------------------------------------
    // Child Node API

    appendChild (child) {
        return this.insertBefore(child, null);
    }

    insertBefore (child, ref) {
        //
    }
}

Object.assign(Node.prototype, {
    _childNodes: EMPTY,
    _ownerDocument: null,
    _parent: null,
    _nextSibling: null,
    _nextSiblingSameTagName: null,
    _previousSibling: null,
    _previousSiblingSameTagName: null,

    access: 'public',
    static: false,
    _text: null,

    _id: null,
    _ignore: false,
    _src : null
});

module.exports = Node;
