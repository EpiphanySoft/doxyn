'use strict';

const Entity = require('./Entity');
const List = require('../List');
const Util = require('../util');
const ChildIndex = require('./ChildIndex');

class Node extends Entity {
    static defineAttribute (name, value) {
        if (name.endsWith('...')) {
            name = name.substr(0, name.length - 3);

            let multiLine = this.getMultiLine();

            multiLine[name] = true;
        }

        super.defineAttribute(name, value);
    }

    static defineMember (name, value) {
        if (name === 'tagName') {
            Object.defineProperty(this, 'tagName', {
                value: value
            });
            Object.defineProperty(this.prototype, 'tagName', {
                value: value
            });
        }
        else {
            super.defineMember(name, value);
        }
    }

    static getMultiLine (C) {
        C = C || this;

        if (!C.hasOwnProperty('multiLine')) {
            let multiLine = this.getMultiLine(Object.getPrototypeOf(C));

            this.multiLine = Object.create(multiLine);
        }

        return this.multiLine;
    }

    constructor (data) {
        super(data);

        this.loc = new Util.Empty(); // map of attr: new Location()
        this.src = new Util.Empty(); // map of attr: '1,2,3'
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

    [Symbol.iterator] () {
        return this._childNodes[Symbol.iterator]();
    }

    //-----------------------------------------------------------
    // Attributes API

    appendAttribute (name, value, at) {
        //
    }

    getAttributeLocation (name) {
        let loc = this.loc[name];

        if (!loc) {
            loc = this.src[name];
            if (loc) {
                //TODO

                this.loc[name] = loc;
            }
        }

        return loc;
    }

    getAttributeSrc (name) {
        let src = this.src[name];

        if (!src) {
            src = this.loc[name];
            if (src) {
                //TODO

                this.src[name] = src;
            }
        }

        return src;
    }

    isAttributeMultiLine (name) {
        let C = this.constructor;

        return !!C.multiLine[name];
    }

    removeAttribute (name) {
        super.removeAttribute(name);

        delete this.loc[name];
        delete this.src[name];
    }

    renameAttribute (oldName, newName) {
        if (this.hasOwnAttribute(oldName)) {
            let loc = this.loc[oldName];
            let src = this.src[oldName];

            let ret = super.renameAttribute(oldName, newName);

            if (loc) {
                this.loc[newName] = loc;
            }
            if (src) {
                this.src[newName] = src;
            }

            return ret;
        }
    }

    setAttribute (name, value, at) {
        super.setAttribute(name, value);

        if (at && value != null) {
            if (at.isLocation) {
                this.loc[name] = at;
                this.src[name] = null;
            }
            else {
                this.loc[name] = null;
                this.src[name] = at;
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
            this._indexByName = new ChildIndex(this, Node.names.sameName);
            this._indexByTagName = new ChildIndex(this, Node.names.sameTagName);
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
    // Serialization

    serialize (to, options) {
        options = options || Node.defaultSerializeOptions;

        to = this.serializeAttributes(to, options);
        return this.serializeChildren(to, options);
    }

    serializeAttributes (to, options) {
        to = to || new Util.Empty();
        options = options || Node.defaultSerializeOptions;

        // Only serialize our own properties (default values do not get written)
        Object.assign(to, this.data);

        if (options.includeSrc) {
            let src, srcOut = to.src = new Util.Empty();

            for (let name of Object.keys(this.data)) {
                if (!(src = this.src[name]) && this.loc[name]) {
                    src = this.getAttributeSrc(name);
                }

                if (src) {
                    srcOut[name] = src;
                }
            }
        }

        return to;
    }

    serializeChildren (to, options) {
        to = to || new Util.Empty();

        let c = this.firstChild;

        if (c) {
            let items = to.items = [];

            for (; c; c = c.nextSibling) {
                let data = c.serialize(null, options);

                if (data) {
                    items.push(data);
                }
            }
        }

        return to;
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
    _indexByName: ChildIndex.EMPTY,
    _indexByTagName: ChildIndex.EMPTY,
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
        static: false,
        'text...': null
    },

    static: {
        defaultSerializeOptions: {
            builtIns: false,
            includeSrc: true
        },

        multiLine: new Util.Empty(),

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
