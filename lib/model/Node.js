'use strict';

const Entity = require('./Entity');
const List = require('../List');
const Util = require('../util');
const ChildIndex = require('./ChildIndex');
const Location = require('./Location');
const SourceMap = require('./SourceMap');

/**
 *
 * Attributes can be decorated like so:
 *
 *      MyNode.define({
 *          attributes: {
 *              // Multiline attribute:
 *              //
 *              'text...': null,
 *
 *              // Composite attribute (uses ',' as value separator)
 *              //
 *              'alias[]': null,
 *
 *              // Composite attribute (uses '|' as value separator)
 *              //
 *              'fires[|]': null
 *          }
 *      });
 */
class Node extends Entity {
    static defineAttribute (name, value) {
        let n = name.length - 2;
        let form = null;
        let sep;

        if (name.endsWith('...')) {
            name = name.substr(0, n - 1);
            form = 'multiline';
        }
        else if (name.endsWith(']')) {
            sep = name[n];

            if (sep === '[') {
                sep = ',';
            }
            else if (name[--n] !== '[') {
                throw new Error(`Invalid composite attribute syntax "${name}": "${value}"`);
            }

            name = name.substr(0, n);
            form = 'composite';
        }

        let attr = super.defineAttribute(name, value);

        attr.composite = attr.multiline = false;
        attr.form = form;

        if (form) {
            attr[form] = true;

            if (sep) {
                attr.separator = sep;
            }
        }

        return attr;
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
    
    set ownerDocument (newDoc) {
        let loc, oldDoc = this._ownerDocument;

        newDoc = newDoc || null;  // root out undefined...

        if (oldDoc === newDoc) {
            return;
        }

        if (oldDoc) {
            let oldBaseDir = oldDoc.baseDir;

            // Since we are changing documents, we switch over to "loc" tracking to
            // allow us to hold absolute paths. If we have a newDoc we use that abs
            // path to determine the proper relative path.
            for (let name of Object.keys(this.data)) {
                if (!(loc = this.loc[name])) {
                    loc = this.getAttributeLocation(name);
                }

                if (loc) {
                    if (loc.isLocation) {
                        loc = loc.clone();
                        loc.file = oldDoc.resolveFile(loc.file);

                        if (newDoc) {
                            loc.file = newDoc.getFile(loc.file);
                        }
                    }
                    else if (loc.isSourceMap) {
                        loc.detach(oldBaseDir);
                        if (newDoc) {
                            loc.attach(newDoc.files, f => newDoc.getFileId(f));
                        }
                    }
                    else {
                        // a Location[]
                        for (let i = loc.length; i-- > 0; ) {
                            loc[i] = oldDoc.resolveLocation(loc[i], true);

                            if (newDoc && loc[i]) {
                                loc[i].file = newDoc.getFile(loc[i].file);
                            }
                        }
                    }
                }

                this.loc[name] = loc || null;
                this.src[name] = null;
            }
        }

        this._ownerDocument = newDoc;
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

        Object.assign(ret.loc, this.loc);
        Object.assign(ret.src, this.src);

        return ret;
    }

    [Symbol.iterator] () {
        return this._childNodes[Symbol.iterator]();
    }

    //-----------------------------------------------------------
    // Attributes API

    appendAttribute (name, value, at) {
        let [ values, loc, src, attr ] = this.normalizeAttribute(name, value, at);

        if (!attr.composite) {
            throw new Error(`Cannot append values to non-composite attribute "${name}"`);
        }
        if (!values.length) {
            return;
        }

        // We always have a value for src and currentSrc (if there is a current
        // value). This is because we store "??" to represent the null values.

        let current = this.getAttribute(name);
        let currentLoc, currentSrc;

        if (current) {
            current.push(...values);

            currentSrc = this.src[name];  // a string
            currentLoc = this.loc[name];  // a Location[]

            if (currentLoc) {
                if (loc) {
                    currentLoc.push(...loc);
                }
                else {
                    currentLoc = null;
                }
            }

            currentSrc += Location.delimiter;
            currentSrc += src;
        }
        else {
            this.data[name] = values;

            currentLoc = loc;
            currentSrc = src;
        }

        this.loc[name] = currentLoc;
        this.src[name] = currentSrc;
    }

    /**
     * Returns the `Location`, `Location[]` or `SourceMap` for the given attribute. The
     * type returned depends on the attribute's form (see `getAttributeForm`).
     *
     *  - Default: Most attributes will return a single `Location` object.
     *  - Composite: Attributes (e.g. "alias" or "fires") that have multiple values
     *   return a `Location[]` describing the location of each value.
     *  - Multiline: Attributes (e.g. "text") that have a value that wraps across more
     *   than one line return a `SourceMap` to describe the location(s) of the concatenated
     *   value.
     *
     * Both `Location` and `SourceMap` provide an `at()` method that can be used to return
     * a `Location` for a specific piece of the value given a character offset into the
     * value.
     *
     * @param {String} name The attribute name.
     * @return {Location/Location[]/SourceMap}
     */
    getAttributeLocation (name) {
        let loc = this.loc[name];

        if (!loc) {
            loc = this.src[name];

            if (loc) {
                let doc = this.ownerDocument;
                let attr = this.constructor.getAttribute(name);

                if (attr.multiline) {
                    loc = new SourceMap(doc.files, this.data[name] || '', loc);
                    loc.onChangeText = this._onChangeAttribute.bind(this, name);
                }
                else {
                    let fn = attr.composite ? 'split' : 'from';
                    loc = Location[fn](loc, f => doc.getFile(+f));
                }

                this.loc[name] = loc;
            }
        }

        return loc || null;
    }

    getAttributeSrc (name) {
        let src = this.src[name];

        if (!src) {
            src = this.loc[name];

            if (src) {
                let doc = this.ownerDocument;

                if (src.isSourceMap) {
                    src = src.toString();
                }
                else if (src.isLocation) {
                    src = doc.encodeLocation(src);
                }
                else {
                    src = doc.encodeLocation(...src);
                }

                this.src[name] = src;
            }
        }

        return src || null;
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
        this.removeAttribute(name);

        if (value === undefined) {
            return;
        }

        let attr = this.constructor.getAttribute(name);

        if (attr.composite) {
            this.appendAttribute(name, value, at);
        }
        else {
            let [ val, loc, src ] = this.normalizeAttribute(name, value, at);

            this.data[name] = val;
            this.loc[name] = loc;
            this.src[name] = src;
        }
    }

    normalizeAttribute (name, value, at) {
        let attr = this.constructor.getAttribute(name);
        let doc = this.ownerDocument;
        let loc, src;

        if (at) {
            if (at.isSourceMap) {
                if (!attr || !attr.multiline) {
                    throw new Error(`SourceMaps are not valid for attribute "${name}"`);
                }

                loc = at;
            }
            else if (at.isLocation) {
                loc = doc.fixupLocation(at.clone());
            }
            else if (Array.isArray(at)) {
                loc = at.map(lc => doc.fixupLocation(lc.clone()));
            }
            else if (typeof at === 'string') {
                src = at;
            }
        }

        if (attr.multiline) {
            // a multiline attribute should have a SourceMap, so we'll just
            // drop back to "src":
            if (loc && loc.isLocation) {
                src = doc.encodeLocation(loc);
                src += Location.separator;
                src += value.length;
                loc = null;
            }
        }
        else if (attr.composite) {
            // composite attributes should be arrays
            if (!Array.isArray(value)) {
                value = value.split(attr.separator);

                if (!value[value.length - 1]) {
                    // Eliminate trailing separator since 'a,'.split(',') = ['a','']
                    value.pop();
                }
            }

            if (loc && loc.isLocation) {
                // and their location is a parallel Location[]
                loc = loc.generate(value);
            }

            if (loc) {
                while (loc.length < value.length) {
                    loc.push(null);
                }

                src = doc.encodeLocation(...loc);
            }
            else {
                if (!at) {
                    loc = [];
                }

                src = src ? src.split(Location.delimiter) : [];

                while (src.length < value.length) {
                    src.push('??');
                    if (loc) {
                        loc.push(null);
                    }
                }

                src = src.join(Location.delimiter);
            }
        }

        return [ value, loc, src, attr ];
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
        let C = this.constructor;
        let src, srcOut;

        to = to || {};
        options = options || Node.defaultSerializeOptions;

        if (options.includeSrc) {
            to.src = srcOut = {};
        }

        // Only serialize our own properties (default values do not get written)
        for (let name of Object.keys(this.data)) {
            let value = this.data[name];

            if (Array.isArray(value)) {
                // composite attributes are stored in memory as String[], so
                // join them now.
                let attr = C.getAttribute(name);
                value = value.join(attr.separator);
            }
            else if (value == null) {
                continue;
            }

            to[name] = value;

            if (srcOut) {
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

    /**
     * This method is called when a multi-line attribute is changed using a SourceMap.
     * @param {String} name The attribute name
     * @param {String} value The attribute value
     * @private
     */
    _onChangeAttribute (name, value) {
        this.data[name] = value;
    }
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
        unknownAttribute: {
            composite: false,
            multiline: false,
            separator: ','
        },

        defaultSerializeOptions: {
            builtIns: false,
            includeSrc: true
        },

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

Object.freeze(Node.unknownAttribute);

module.exports = Node;
