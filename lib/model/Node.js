'use strict';

const Entity = require('./Entity');

const EMPTY = [];
Object.freeze(EMPTY);

class Node extends Entity {
    constructor () {
        super();

        this.src = {
            // attr: location
        }
    }

    //-----------------------------------------------------------
    // Properties

    get childNodes () {
        return this._childNodes;
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

    removeAttribute (name) {
        super.removeAttribute(name);
        delete this.src[name];
    }

    setAttribute (name, value, location) {
        super.setAttribute(name, value);

        if (location && value != null) {
            this.src[name] = location;
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
        let me = this,
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
        let parent = this._parent;
        
        if (parent) {
            parent.removeChild(this);
        }

        return !!parent;
    }

    removeChild (child) {
        let me = this,
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

Node.define({
    _childNodes: EMPTY,
    _ownerDocument: null,
    _parent: null,
    _nextSibling: null,
    _nextSiblingSameTagName: null,
    _previousSibling: null,
    _previousSiblingSameTagName: null,

    _text: null,

    _ignore: false,
    _src : null,

    attributes: {
        access: 'public',
        static: false
    }
});

module.exports = Node;
