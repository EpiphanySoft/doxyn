"use strict";

const Message = require('doxyn/lib/message/Message');
const Event   = require('doxyn/lib/message/Event');

const LEVEL = {
    error: 'E',
    warning: 'W',
    info: 'I',
    debug: 'D',
    disable: null
};

const OUT = {
    E (s) {
        console.error(s);
    },

    W (s) {
        console.warn(s);
    },

    I (s) {
        console.info(s);
    },

    D (s) {
        console.log(s);
    }
};

class Manager {
    constructor (prefix) {
        let me = this;

        me.prefix = prefix || 'D';
        me.messages = Message.create();

        me.logged = {};
        me.sinks = [];

        me.addSink(ev => {
            let fn = OUT[ev.msg.level];

            if (fn) {
                fn(ev.toString());
            }
        }, -1);
    }

    addSink (fn, priority) {
        fn.priority = priority || 0;

        let sinks = this.sinks;

        sinks.push(fn);

        if (sinks.length > 1) {
            sinks.sort(Manager._sinkSorter);
        }
    }

    /**
     * Process a config object with the following properties:
     * 
     *   * default: The default level ("debug", "warning", "error", "info").
     *   * error: An array of named messages to treat as errors.
     *   * warning: An array of named messages to treat as warning.
     *   * info: An array of named messages to treat as informational.
     *   * debug: An array of named messages to treat as debug.
     *   * disable: An array of named messages to disable.
     *   
     * @param {Object} options
     */
    configure (options) {
        const def = options.default;
        const messages = this.messages;
        
        this.reset(def && LEVEl[def]);
        
        for (let level in options) {
            if (level !== 'default') {
                let lvl = LEVEL[level];
                
                if (lvl !== undefined) {
                    for (let code of options[level]) {
                        let msg = messages[code] || messages.codes[code];

                        if (msg) {
                            msg.level = lvl;
                        }
                    }
                }
            }
        }
    }
    
    createEvent (src, msg, format, params) {
        return new Event(this.prefix, src, msg, format, params);
    }
    
    log (src, msg, format, ...params) {
        let event = this.createEvent(src, msg, format, params),
            text = event.toString(),
            logged = this.logged;

        if (!(event.duplicate = text in logged)) {
            logged[text] = 1;
        }

        for (let sink of this.sinks) {
            if (sink(event) === false) {
                break;
            }
        }
    }
    
    registerMessage (level, code, name, message) {
        return this.messages.add(level, code, name, message);
    }
    
    reset (def) {
        const messages = this.messages;

        for (let msg of messages.values) {
            if (def === undefined) {
                msg.level = msg.defaultLevel;
            } else {
                msg.level = def;
            }
        }

        this.logged = {};
    }

    static _sinkSorter (a, b) {
        // sort by priority DESC
        return b.priority - a.priority;
    }
}

module.exports = Manager;
