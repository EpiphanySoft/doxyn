'use strict';

const Entity = require('./Entity');
const List = require('../List');
const Util = require('../util');

class Index {
    constructor (owner, property, siblingNames) {
        this.owner = owner;
        this.property = property;
        this.siblingNames = siblingNames;

        this.map = new Util.Empty();
        this.sym = Symbol('indexList');
    }

    sync (item) {
        let key = item[this.property];
        let sym = this.sym;
        let list = item[sym];

        if (list) {
            list.remove(item);
        }

        if (key == null) {
            list = null;
        }
        else {
            let childNodes = this.owner._childNodes;
            let index = childNodes.indexOf(item);
            let len = childNodes.length;
            let midway = Math.floor(len / 2);

            if (!(list = this.map[key])) {
                this.map[key] = list = new List(this.siblingNames);
                list.owner = this;
            }

            if (index === childNodes.length - 1) {
                list.append(item);
            }
            else if (!index) {
                list.insert(item, list.first);
            }
            else if (index < midway) {
                // The item is in the first half of the childNodes, so we walk over
                // that half backwards.
                for (let i = midway; i-- > 0; ) {
                    let c = childNodes[i];

                    if (c[sym] === list) {
                        //
                    }
                }
            }
            else {
                for (let i = midway; i < len; ++i) {
                    //
                }
            }
        }

        item[sym] = list;
    }
}

class Node extends Entity {
    constructor () {
        super();

        this.src = new Util.Empty(); // map of attr: location
    }

    //-----------------------------------------------------------
    // Properties

    get childIndex () {
        let p = this._parent;
        return p ? p._childNodes.indexOf(this) : -1;
    }

    get childNodes () {
        return this._childNodes;
    }

    get firstChild () {
        return this._children.first;
    }

    get lastChild () {
        return this._children.last;
    }

    get ownerDocument () {
        return this._ownerDocument;
    }
    
    set ownerDocument (v) {
        let was = this._ownerDocument;
        this._ownerDocument = v;

        if (was && was !== v) {
            //TODO
        }
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
        if (child === ref) {
            throw new Error('Cannot insert a child before itself');
        }

        child.remove();

        if (childNodes === Util.EMPTY) {
            this._childNodes = childNodes = [];
            this._children = new List({
                next: 'nextSibling',
                prev: 'previousSibling'
            });
            this._indexByTagName = new Util.Empty();
            this._indexByName = new Util.Empty();
        }

        if (ref) {
            index = childNodes.indexOf(ref);
            if (index < 0) {
                index = length;
            }
        }
        
        childNodes.splice(index, 0, child);
        child._parent = me;

        this._children.insert(child, ref);
        
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

            this._children.remove(child);

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

    _addToIndex (index, child) {
        //
    }
}

Node.define({
    _childNodes: Util.EMPTY,
    _children: List.EMPTY,
    _ownerDocument: null,
    _parent: null,
    _nextSibling: null,
    _nextSiblingSameTagName: null,
    _previousSibling: null,
    _previousSiblingSameTagName: null,

    _text: null,

    attributes: {
        access: 'public',
        ignore: false,
        static: false
    }
});

module.exports = Node;
