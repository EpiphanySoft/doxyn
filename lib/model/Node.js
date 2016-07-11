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
        this._id = v || ++idSeed;
    }
    
    get ownerDocument () {
        return this._ownerDocument;
    }
    
    set ownerDocument (v) {
        this._ownerDocument = v;
        //TODO
    }

    get parent () {
        return this._parent;
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
        var me = this,
            parent = child.parent,
            childNodes = this._childNodes,
            length = childNodes.length,
            index = length;

        if (child === me) {
            throw new Error('Cannot add a node to itself');
        }

        if (parent) {
            parent.removeChild(child);
        }

        if (childNodes === EMPTY) {
            this._childNodes = childNodes = [];
        }

        if (ref) {
            index = childNodes.indexOf(ref);
            if (index < 0) {
                index = length;
            }
        }
        
        childNodes.splice(index, 0, child);
        child._parent = me;
        
        child.ownerDocument = me.ownerDocument;
        me.onAdd(child);
        child.onAdded(me);

        return child;
    }

    removeChild (child) {
        //
    }

    //-----------------------------------------------------------
    // Internals

    onAdd (child) {
        //
    }

    onAdded (parent) {
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
