'use strict';

class Base {
    static define (members) {
        let C = this;
        let queue = [
            [ C.prototype, members ]
        ];

        if (members.static) {
            queue.push([ C, members.static ]);
            delete members.static;
        }

        while (queue.length) {
            let [ target, values ] = queue.pop();

            Object.assign(target, values);
        }

        return C;
    }
}

module.exports = Base;
