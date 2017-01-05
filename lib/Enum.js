'use strict';

const Base = require('./Base');
const Util = require('./util');

let allowed = null;

/**
 * This class is designed to be a base class for enums. Enums are like Java enums in
 * that they are a fixed set of object instances with distinguished names. For example:
 *
 *      class MyEnum extends Enum {
 *          method (x) {
 *              // ...
 *          }
 *      }
 *
 *      MyEnum.define({
 *          values: {
 *              Foo:
 *          }
 *      });
 */
class Enum extends Base {
    constructor (config) {
        super();

        if (allowed !== this.constructor) {
            throw new Error(`Cannot create enum class instances`);
        }

        Object.assign(this, config);
    }

    init () {
        Object.freeze(this);
    }

    static [Symbol.iterator] () {
        return this.values[Symbol.iterator]();
    }

    static define (members) {
        let values = members.values;
        let sup = Object.getPrototypeOf(this);
        let map = new Util.Empty();

        this.codes = Object.create(sup.codes);
        this.values = sup.values.slice();

        if (values) {
            delete members.values;
            allowed = this;

            for (let name of Object.keys(values)) {
                let v = values[name];

                if (typeof v === 'string') {
                    v = this._parse(v);
                }
                else {
                    let m = this._parse(v.text);
                    let t = m.text;

                    Object.assign(m, v);
                    m.text = t;
                    v = m;
                }

                v.name = name;
                v.upperName = name.toUpperCase();
                v.defaultLevel = v.defaultLevel || v.level;

                if (map[v.upperName]) {
                    throw new Error(`Duplicate enum constant name "${name}"`);
                }
                if (v.code && this.codes.hasOwnProperty(v.code)) {
                    throw new Error(`Duplicate enum code ${v.code} for "${name}"`);
                }

                map[v.upperName] = true;

                let c = new allowed(v);
                c.init();

                this.values.push(c);
                this[name] = this[v.upperName] = c;

                if (c.code) {
                    this.codes[c.code] = c;
                }
            }

            allowed = null;
        }

        return super.define(members);
    }

    static _parse (text) {
        // 'E1000: Bad stuff'   (full level, code and text)
        // 'E: Bad stuff'       (just level and text)
        // 'Bad stuff'          (just text)
        let m = this.codeRe.exec(text);

        if (!m) {
            return { level: 'D', code: 0, text };
        }

        return {
            level: m[1],
            code: m[2] ? parseInt(m[2], 10) : 0,
            text: text.substr(m[0].length)
        };
    }
}

Enum.codeRe = /^([EWIDT])(\d+)?:\s+/;
Enum.codes = new Util.Empty();
Enum.values = [];

Object.defineProperty(Enum.prototype, 'isEnum', {
    value: true
});

module.exports = Enum;
