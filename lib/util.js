'use strict';

const Util = module.exports = {
};

Util.Empty = function () {};

// Objects w/o hasOwnProperty are a bit too poisonous, so restore hop:
Object.defineProperty(Util.Empty.prototype = Object.create(null), 'hasOwnProperty', {
    value: Object.prototype.hasOwnProperty
});
