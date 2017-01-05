'use strict';

const Base = require('../Base');

const fmtRe = /[$](\d+)/g;

class Event extends Base {
    constructor (prefix, src, msg, format, params) {
        super();

        let me = this;
        
        me.prefix = prefix;
        me.src = src;
        me.msg = msg;
        me.format = format;
        me.params = params;

        me.timeStamp = Date.now();
    }
    
    get message () {
        return this.msg.text;
    }
    
    toString () {
        let me = this,
            fmt = me.format,
            msg = me.msg,
            str = msg.text,
            params = me.params,
            src = me.src;
        
        if (fmt) {
            str += ' (' + fmt.replace(fmtRe, (m,n) => params[+n - 1]) + ')';
        }

        if (src) {
            str += ' -- ' + src;
        }

        str = me.prefix + msg.code + ': ' + str;
        return str;
    }
}

module.exports = Event;
