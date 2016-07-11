"use strict";

class Message {
    constructor () {
        this.values = [];
        this.codes = {};
    }

    add (_level, _code, _name, _message) {
        if (Message[_name]) {
            throw new Error(`Duplicate message registered: ${_name}`);
        }

        if (Message.codes[_code]) {
            throw new Error(`Duplicate message code registered: ${_code} (${_name})`);
        }

        var msg = {
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

        Message[_name] = msg;
        Message.codes[_code] = msg;
        Message.values.push(msg);

        return msg;
    }

    static create () {
        var me = new Message();

        me.add('E', 1000, 'TagInvalidInContext', 'Tag is not valid in this context');

        return me;
    }
}

module.exports = Message;
