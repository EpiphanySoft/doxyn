'use strict';

const Enum = require('../Enum');

class Message extends Enum {
}

Message.define({
    values: {
        TagInvalidInContext: 'E1000: Tag is not valid in this context'
    }
});

module.exports = Message;
