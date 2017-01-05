'use strict';

class List {
    constructor (siblingNames) {
        this.first = this.last = null;
        this.length = 0;

        this.siblings = siblingNames || List.defaultSiblings;
    }

    append (child) {
        this.insert(child, null);
    }

    contains (child) {
        return this.indexOf(child) > -1;
    }

    indexOf (child) {
        let next = this.siblings.next;

        for (let i = 0, c = this.first; c; ++i, c = c[next]) {
            if (c === child) {
                return i;
            }
        }

        return -1;
    }

    insert (child, before) {
        if (child === before) {
            throw new Error('Cannot insert a child before itself');
        }

        let { next, prev } = this.siblings;

        if (!this.first) {
            if (before !== null) {
                throw new Error('Invalid "before" item');
            }

            this.first = this.last = child;
            child[next] = child[prev] = null;
        }
        else if (before) {
            let p = before[prev];

            if (p) {
                p[next] = child;
            }
            else {
                this.first = child;
            }

            child[prev] = p;
            child[next] = before;

            before[prev] = child;
        }
        else {
            let p = this.last;

            p[next] = child;

            child[prev] = p;
            child[next] = null;

            this.last = child;
        }

        ++this.length;
    }

    remove (child) {
        let { next, prev } = this.siblings;
        let nx = child[next];
        let pr = child[prev];

        if (this.first === child) {
            if (!(this.first = nx)) {
                this.last = null;
            }
            else {
                nx[prev] = null;
            }
        }
        else if (this.last === child) {
            this.last = pr;
            pr[next] = null;
        }
        else {
            // Too expensive to ensure that child is in this list...
            nx[prev] = pr;
            pr[next] = nx;
        }

        child[next] = child[prev] = null;
        --this.length;
    }
}

Object.freeze(List.defaultSiblings = {
    next: 'next',
    prev: 'prev'
});

Object.freeze(List.EMPTY = new List());

module.exports = List;
