'use strict';

const Entity = require('./Entity');
const List = require('../List');
const Util = require('../util');

class Index {
    constructor (owner, names) {
        this.owner = owner;
        this.names = names;

        this.map = new Util.Empty();
        this.tagSym = Symbol('IndexTag');
    }

    get (key, which) {
        let list = this.map[key] || null;

        return (which == null) ? list || List.EMPTY : (list && list[which]);
    }

    remove (item) {
        let sym = this.tagSym;
        let list = item[sym];

        if (list) {
            // Remove from old list. It is possible that an item moves around in the
            // childNodes, so we don't attempt to drop out if the list is the same as
            // before...
            list.remove(item);
        }
    }

    sync (item, index) {
        let key = item[this.names.prop];
        let sym = this.tagSym;
        let list = item[sym];

        if (list) {
            // Remove from old list. It is possible that an item moves around in the
            // childNodes, so we don't attempt to drop out if the list is the same as
            // before...
            list.remove(item);
        }

        if (key == null) {
            return;
        }

        let childNodes = this.owner._childNodes;
        let len = childNodes.length;
        let c, i, next;

        if (index == null) {
            index = item.childIndex;
        }

        if (!(list = this.map[key])) {
            this.map[key] = list = new List(this.names);

            list.key = key;
            list.owner = this;
            list.tagSym = sym;  // all lists in this Index share the same tagSym
        }

        if (index < len / 2) {
            // The item is in the first half of the childNodes, so walk backwards
            // from the "item". That is the smallest portion of childNodes that we
            // can process to determine where the "item" belongs.
            next = list.first;

            for (i = index; i-- > 0; ) {
                c = childNodes[i];

                if (c === list.last) {
                    // The current last is before "item", so "item" becomes the
                    // new last:
                    next = null;
                    break;
                }
                if (c[sym] === list) {
                    // Another member of this list, so that is the previous node
                    // for "item" which makes that nodes's "next" the reference
                    // node for "item"
                    next = c[this.names.next];
                    break;
                }
            }

            // If we processed all nodes before "item" and didn't find any that
            // are in the same list, then "next" is still set to "list.first" and
            // that is correct... "item" is the new first.
        }
        else {
            // The item is in the second half of the childNodes, so it is shorter
            // to walk from "item" to the end.
            next = null;

            for (i = index; ++i < len; ) {
                c = childNodes[i];

                if (c[sym] === list) {
                    // Another member of this list, so that is the next node
                    // after "item".
                    next = c;
                    break;
                }
            }

            // If we process all nodes after "item" and did not find any in
            // the same list then "item" is the new last (next = null).
        }

        list.insert(item, next);
    }
}

Object.freeze(Index.EMPTY = new Index());
Object.freeze(Index.EMPTY.map);

//------------------------------------------------------------------------------------

class Node extends Entity {
    constructor (data) {
        super(data);

        this.src = new Util.Empty(); // map of attr: location
    }

    //-----------------------------------------------------------
    // Properties

    get childIndex () {
        let p = this._parent;
        let cn = p && p._childNodes;

        if (cn) {
            let i = cn.length - 1;

            if (cn[i] === this) {
                // It is fairly common to talk about the last item, so cheat
                // and see if that is what we are... (save O(n) lookup)
                return i;
            }

            return cn.indexOf(this);
        }

        return -1;
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

    get name () {
        return this.getAttribute('name');
    }

    set name (value) {
        this.setAttribute('name', value);

        let p = this._parent;

        if (p) {
            p._indexByName.sync(this);
        }
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

    get tagName () {
        return this._tagName;
    }

    set tagName (value) {
        this._tagName = value;

        let p = this._parent;

        if (p) {
            p._indexByTagName.sync(this);
        }
    }

    //-----------------------------------------------------------
    // Methods

    cloneNode (deep) {
        let ret = this.clone();

        if (deep) {
            for (let c = this.firstChild; c; c = c.nextSibling) {
                ret.appendChild(c.cloneNode(true));
            }
        }

        return ret;
    }

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

    contains (child) {
        let depth = 0;

        for (let c = child; c; ++depth, c = c._parent) {
            if (c === this) {
                return depth;  // if child === this, depth = 0 (which is correct)
            }
        }

        return 0;
    }

    getChildrenByName (name) {
        return this._indexByName.get(name);
    }

    getChildrenByTagName (tagName) {
        return this._indexByTagName.get(tagName);
    }

    getFirstChildByName (name) {
        return this._indexByName.get(name, 'first');
    }

    getFirstChildByTagName (tagName) {
        return this._indexByTagName.get(tagName, 'first');
    }

    getLastChildByName (name) {
        return this._indexByName.get(name, 'last');
    }

    getLastChildByTagName (tagName) {
        return this._indexByTagName.get(tagName, 'last');
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
            this._children = new List(Node.names.children);
            this._indexByName = new Index(this, Node.names.sameName);
            this._indexByTagName = new Index(this, Node.names.sameTagName);
        }

        if (ref) {
            index = childNodes.indexOf(ref);
            if (index < 0) {
                index = length;
            }
        }
        
        child._parent = me;

        childNodes.splice(index, 0, child);
        this._children.insert(child, ref);
        this._indexByName.sync(child, index);
        this._indexByTagName.sync(child, index);
        
        child.ownerDocument = me.ownerDocument;
        me.onAdded(child);
        child.onAddedTo(me);

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
            this._indexByName.remove(child);
            this._indexByTagName.remove(child);

            child.onRemovedFrom(me);
            me.onRemoved(child);
        }

        return child;
    }

    replaceChild (newChild, oldChild) {
        if (oldChild === newChild) {
            throw new Error('Cannot replace a child node with itself');
        }
        if (oldChild._parent !== this) {
            throw new Error('Invalid oldChild passed to replaceChild');
        }

        this.insertBefore(newChild, oldChild);
        oldChild.remove();
        return oldChild;
    }

    //-----------------------------------------------------------
    // Protected

    onAdded (child) {
        //
    }

    onAddedTo (parent) {
        //
    }

    onRemoved (child) {
        //
    }

    onRemovedFrom (parent) {
        //
    }

    //-----------------------------------------------------------
    // Private
}

Node.define({
    _childNodes: Util.EMPTY,
    _children: List.EMPTY,
    _indexByName: Index.EMPTY,
    _indexByTagName: Index.EMPTY,
    _ownerDocument: null,
    _parent: null,

    nextSibling: null,
    nextSiblingSameName: null,
    nextSiblingSameTagName: null,
    previousSibling: null,
    previousSiblingSameName: null,
    previousSiblingSameTagName: null,

    _name: null,
    _tagName: null,
    _text: null,

    attributes: {
        access: 'public',
        ignore: false,
        static: false
    },

    static: {
        names: {
            children: {
                next: 'nextSibling',
                prev: 'previousSibling'
            },
            sameName: {
                next: 'nextSiblingSameName',
                prev: 'previousSiblingSameName',
                prop: 'name'
            },
            sameTagName: {
                next: 'nextSiblingSameTagName',
                prev: 'previousSiblingSameTagName',
                prop: 'tagName'
            }
        }
    }
});

module.exports = Node;
