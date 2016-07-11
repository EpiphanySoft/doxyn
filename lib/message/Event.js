"use strict";

const fmtRe = /[%](\d+)/g;

class Event {
    constructor (prefix, src, msg, format, params) {
        var me = this;
        
        me.prefix = prefix;
        me.src = src;
        me.msg = msg;
        me.format = format;
        me.params = params;

        me.timeStamp = Date.now();
    }
    
    get message () {
        return this.msg.message;
    }
    
    toString () {
        var me = this,
            fmt = me.format,
            msg = me.msg,
            str = msg.message,
            params = me.params,
            src = me.src;
        
        if (fmt) {
            str = fmt.replace(fmtRe, (m,n) => params[n]) + ' (' + str + ')';
        }

        if (src) {
            str += ' -- ' + src;
        }

        str = me.prefix + msg.code + ': ' + str;
        return str;
    }
}

module.exports = Event;
