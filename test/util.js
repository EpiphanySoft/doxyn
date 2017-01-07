'use strict';

/* global require */

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
    },

    equal: {
        evaluate: function evaluate (actual, expected) {
            if (actual && actual.$isFile && typeof expected === 'string') {
                actual = actual.path;
            }

            return evaluate._super.call(this, actual, expected);
        }
    }
});
