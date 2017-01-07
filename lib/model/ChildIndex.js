'use strict';

const List = require('../List');
const Util = require('../util');

class ChildIndex {
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
            list.tagSym = sym;  // all lists in this ChildIndex share the same tagSym
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

Object.freeze(ChildIndex.EMPTY = new ChildIndex());
Object.freeze(ChildIndex.EMPTY.map);

module.exports = ChildIndex;
