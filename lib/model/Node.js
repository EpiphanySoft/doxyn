"use strict";

const EMPTY = [];

Object.freeze(EMPTY);

var idSeed = 0;

class Node {
    constructor () {
        var me = this;
        
        me.data = {
            // attr: value
        };

        me.src = {
            // attr: location
        }
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

    
    //-----------------------------------------------------------
    // Attributes API

    getAttribute (name) {
        return this.data[name] || null;
    }
    
    removeAttribute (name) {
        delete this.data[name];
        delete this.src[name];
    }
    
    setAttribute (name, value, location) {
        if (value == null) {
            this.removeAttribute(name);
        } else {
            this.data[name] = value;

            if (location) {
                this.src[name] = location;
            }
        }
    }

    //-----------------------------------------------------------
    // Child Node API

    appendChild (child) {
        return this.insertBefore(child, null);
    }
    
    child (tagName) {
        //
    }

    insertBefore (child, ref) {
        var me = this,
            childNodes = this._childNodes,
            length = childNodes.length,
            index = length;

        if (child === me) {
            throw new Error('Cannot add a node to itself');
        }

        child.remove();

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
    
    remove () {
        var parent = this._parent;
        
        if (parent) {
            parent.removeChild(this);
        }

        return !!parent;
    }

    removeChild (child) {
        var me = this,
            childNodes = me._childNodes,
            index = childNodes.indexOf(child);

        if (index > -1) {
            childNodes.splice(index, 1);
            child._parent = null;

            child.onRemoved(me);
            me.onRemove(child);
        }

        return child;
    }

    replaceChild (newChild, oldChild) {
        if (oldChild._parent !== this) {
            throw new Error('Invalid oldChild passed to replaceChild');
        }

        this.insertBefore(newChild, oldChild);
        oldChild.remove();
        return oldChild;
    }

    //-----------------------------------------------------------
    // Internals

    onAdd (child) {
        //
    }

    onAdded (parent) {
        //
    }

    onRemove (child) {
        //
    }

    onRemoved (parent) {
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
