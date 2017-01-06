'use strict';

const Base = require('../Base');

let idSeed = 0;

class Entity extends Base {
    static define (members) {
        let attributes = members.attributes;

        if (attributes) {
            const Data = this.getData(this);

            delete members.attributes;

            Object.keys(attributes).forEach(name => {
                Data.prototype[name] = attributes[name];

                Object.defineProperty(this.prototype, name, {
                    get () {
                        return this.data[name];
                    },

                    set (value) {
                        this.setAttribute(name, value);
                    }
                });
            });
        }

        return super.define(members);
    }

    static getData (C) {
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
        let Data = C.hasOwnProperty('Data') ? C.Data : C.getData(C);

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
