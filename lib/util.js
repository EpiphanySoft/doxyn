'use strict';

const Util = module.exports = {
    EMPTY: []
};

Object.freeze(Util.EMPTY);

Util.Empty = function (data) {
    if (data) {
        Object.assign(this, data);
    }
};

// Objects w/o hasOwnProperty are a bit too poisonous, so restore hop:
Object.defineProperty(Util.Empty.prototype = Object.create(null), 'hasOwnProperty', {
    value: Object.prototype.hasOwnProperty
});
