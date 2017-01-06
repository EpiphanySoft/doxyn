'use strict';

class Base {
    static define (members) {
        let statics = members.static;

        if (statics) {
            for (let s of Object.keys(statics)) {
                this.defineStaticMember(s, statics[s]);
            }
        }

        for (let s of Object.keys(members)) {
            if (s !== 'static') {
                this.defineMember(s, members[s]);
            }
        }

        return this;
    }

    static defineMember (name, value) {
        this.prototype[name] = value;
    }

    static defineStaticMember (name, value) {
        this[name] = value;
    }
}

module.exports = Base;
