'use strict';

const Base = require('../Base');

let idSeed = 0;

class Entity extends Base {
    constructor () {
        super();

        this._id = ++idSeed;

        let C = this.constructor;
        let Data = C.hasOwnProperty('Data') ? C.Data : C.getData();

        this.data = new Data();
    }

    static define (members) {
        let attributes = members.attributes;

        if (attributes) {
            const Data = this.getData();

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

    static getData () {
        if (!this.hasOwnProperty('Data')) {
            const BaseData = super.getData();

            this.Data = class extends BaseData {};
        }

        return this.Data;
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
        return this.data.hasOwnProperty(name);
    }
    
    removeAttribute (name) {
        delete this.data[name];
    }
    
    setAttribute (name, value) {
        if (value == null) {
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

Entity.Data.prototype = Object.create(null);
Entity.Data.prototype.hasOwnProperty = Object.prototype.hasOwnProperty; // for sanity

module.exports = Entity;
