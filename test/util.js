'use strict';

/* global describe, it, afterEach, beforeEach */

const Assert = require('assertly');

Assert.setup();
Assert.register({
    attribute: {
        evaluate (entity, name, value) {
            if (!entity[this._modifiers.own ? 'hasOwnAttribute' : 'hasAttribute'](name)) {
                return false;
            }

            if (value !== undefined) {
                let v = entity.getAttribute(name);
                return value === v;
            }

            return true;
        },

        explain (entity, name, value) {
            if (value !== undefined) {
                this.expectation = `${Assert.print(name)} === ${Assert.print(value)}`;
            }
        }
    }
});
