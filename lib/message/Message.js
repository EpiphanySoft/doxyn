"use strict";

class Message {
    constructor () {
        this.values = [];
        this.codes = {};
    }

    add (_level, _code, _name, _message) {
        let me = this;

        if (me[_name]) {
            throw new Error(`Duplicate message registered: ${_name}`);
        }

        if (me.codes[_code]) {
            throw new Error(`Duplicate message code registered: ${_code} (${_name})`);
        }

        let msg = {
            get code () {
                return _code;
            },

            get defaultLevel () {
                return _level;
            },

            level: _level,

            get message () {
                return _message;
            },

            get name () {
                return _name;
            }
        };

        me[_name] = msg;
        me.codes[_code] = msg;
        me.values.push(msg);

        return msg;
    }

    static create () {
        let me = new Message();

        me.add('E', 1000, 'TagInvalidInContext', 'Tag is not valid in this context');

        return me;
    }
}

module.exports = Message;
