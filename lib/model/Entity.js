'use strict';

const Base = require('../Base');

let idSeed = 0;

class Entity extends Base {
    static defineAttribute (name, value) {
        const Data = this.getData();

        Data.prototype[name] = value;

        if (!Object.getOwnPropertyDescriptor(this.prototype, name)) {
            Object.defineProperty(this.prototype, name, {
                get () {
                    return this.data[name];
                },

                set (v) {
                    this.setAttribute(name, v);
                }
            });
        }
    }

    static defineMember (name, value) {
        if (name !== 'attributes') {
            super.defineMember(name, value);
        }
        else if (value) {
            for (let s of Object.keys(value)) {
                this.defineAttribute(s, value[s]);
            }
        }
    }

    static getData (C) {
        C = C || this;

        if (!C.hasOwnProperty('Data')) {
            const BaseData = this.getData(Object.getPrototypeOf(C));

            this.Data = class extends BaseData {};
        }

        return this.Data;
    }

    constructor (data) {
        super();

        this._id = ++idSeed;

        let C = this.constructor;
        let Data = C.hasOwnProperty('Data') ? C.Data : C.getData();

        this.data = new Data(data);
    }

    clone () {
        let C = this.constructor;

        return new C(this.data);
    }

    //-----------------------------------------------------------
    // Properties

    /**
     * @property {Number} id
     * @readonly
     */
    get id () {
        return this._id;
    }

    //-----------------------------------------------------------
    // Attributes API

    getAttribute (name) {
        return this.data[name] || null;
    }

    hasAttribute (name) {
        return name in this.data;
    }

    hasOwnAttribute (name) {
        return this.data.hasOwnProperty(name);
    }

    removeAttribute (name) {
        delete this.data[name];
    }

    renameAttribute (oldName, newName) {
        if (this.hasOwnAttribute(oldName)) {
            let value = this.getAttribute(oldName);

            this.removeAttribute(oldName);
            this.setAttribute(newName, value);

            return value;
        }
    }
    
    setAttribute (name, value) {
        if (value === undefined) {
            this.removeAttribute(name);
        } else {
            this.data[name] = value;
        }
    }
}

Entity.Data = function (values) {
    if (values) {
        Object.assign(this, values);
    }
};

Object.defineProperty(Entity.Data.prototype = Object.create(null), 'hasOwnProperty', {
    // for sanity
    value: Object.prototype.hasOwnProperty
});

module.exports = Entity;
